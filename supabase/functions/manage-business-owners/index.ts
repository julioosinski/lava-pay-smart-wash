
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1"

// Define types for our requests
interface BusinessOwnerInput {
  name: string;
  email: string;
  phone: string;
  id?: string;
}

interface ActionRequest {
  action: 'create' | 'update' | 'delete';
  data: BusinessOwnerInput;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') ?? '' },
        },
      }
    )
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the request body
    const requestData: ActionRequest = await req.json()
    const { action, data } = requestData
    
    // Extract the user from the token for logging purposes
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    console.log(`User ${user.id} performing ${action} for business owner data:`, data)
    
    // Handle the different operations
    if (action === 'create') {
      // Create new business owner
      const { name, email, phone } = data
      
      // Check if a user with this email already exists in profiles
      const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('id, role')
        .eq('contact_email', email)
        .maybeSingle()
      
      if (existingUser?.id) {
        console.log("User already exists, updating to business role:", existingUser)
        
        // Split the name into first and last name
        const nameParts = name.split(' ')
        const firstName = nameParts[0]
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''
        
        // Update the profile with service role to bypass RLS
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            contact_phone: phone,
            role: 'business',
            first_name: firstName,
            last_name: lastName,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)
        
        if (updateError) {
          console.error("Error updating existing profile:", updateError)
          return new Response(
            JSON.stringify({ success: false, error: updateError.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }
        
        // Update any laundries that may be associated with this email
        await supabaseAdmin
          .from('laundries')
          .update({ owner_id: existingUser.id })
          .eq('contact_email', email)
        
        return new Response(
          JSON.stringify({ success: true, userId: existingUser.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // If no existing user, create a new auth user with phone as password
      const cleanPhone = phone.replace(/\D/g, '')
      const password = cleanPhone || "business123" // Fallback if phone is empty
      
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: name.split(' ')[0],
          last_name: name.split(' ').slice(1).join(' ')
        }
      })
      
      if (authError) {
        console.error("Error creating user:", authError)
        return new Response(
          JSON.stringify({ success: false, error: authError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
      
      const userId = authData.user.id
      
      // Update the profile with service role
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          contact_phone: phone,
          contact_email: email,
          role: 'business',
          first_name: name.split(' ')[0],
          last_name: name.split(' ').slice(1).join(' ') || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        
      if (updateError) {
        console.error("Error updating profile:", updateError)
        // Continue since user was created successfully
      }
      
      // Also update any laundries with this contact email
      await supabaseAdmin
        .from('laundries')
        .update({ owner_id: userId })
        .eq('contact_email', email)
      
      return new Response(
        JSON.stringify({ success: true, userId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } 
    else if (action === 'update') {
      // Update existing business owner
      const { id, name, email, phone } = data
      
      if (!id) {
        return new Response(
          JSON.stringify({ success: false, error: "ID is required for updating business owner" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      
      // Split the name into first and last name
      const nameParts = name.split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''
      
      // Update profile with service role to bypass RLS
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          contact_phone: phone,
          contact_email: email,
          role: 'business',
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (updateError) {
        console.error("Error updating profile:", updateError)
        return new Response(
          JSON.stringify({ success: false, error: updateError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
      
      // Update laundries owned by this user
      await supabaseAdmin
        .from('laundries')
        .update({
          contact_email: email,
          contact_phone: phone
        })
        .eq('owner_id', id)
      
      return new Response(
        JSON.stringify({ success: true, userId: id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } 
    else if (action === 'delete') {
      // Delete (actually just demote to regular user) business owner
      const { id } = data
      
      if (!id) {
        return new Response(
          JSON.stringify({ success: false, error: "ID is required for deleting business owner" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      
      // First check if this user owns any laundries
      const { data: laundries, error: checkError } = await supabaseAdmin
        .from('laundries')
        .select('id, name')
        .eq('owner_id', id)
        
      if (checkError) {
        console.error("Error checking laundries:", checkError)
        return new Response(
          JSON.stringify({ success: false, error: checkError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
      
      // If user has laundries, don't allow deletion
      if (laundries && laundries.length > 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Este proprietário possui ${laundries.length} lavanderia(s). Remova as lavanderias primeiro.` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      
      // Update the profile to remove business role
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          role: 'user',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (updateError) {
        console.error("Error removing business role:", updateError)
        return new Response(
          JSON.stringify({ success: false, error: updateError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({ success: false, error: "Invalid action" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  } catch (error) {
    console.error("Error in manage-business-owners function:", error)
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
