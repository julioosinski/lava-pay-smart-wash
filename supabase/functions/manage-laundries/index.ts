
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1"

// Define types for our requests
interface LaundryInput {
  name: string;
  address: string;
  contact_phone: string;
  contact_email: string;
  owner_id: string;
  status: string;
  id?: string;
}

interface ActionRequest {
  action: 'create' | 'update' | 'delete' | 'list';
  laundry?: LaundryInput;
  ownerId?: string;
  forceShowAll?: boolean;
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

    // Extract the user from the token for logging purposes
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    // Get the request body
    const requestData: ActionRequest = await req.json()
    const { action, laundry, ownerId, forceShowAll } = requestData
    
    console.log(`User ${user.id} performing ${action}`)
    
    if (action === 'create') {
      // Create new laundry using service role to bypass RLS
      const { data, error } = await supabaseAdmin
        .from('laundries')
        .insert({
          name: laundry?.name,
          address: laundry?.address,
          contact_phone: laundry?.contact_phone,
          contact_email: laundry?.contact_email,
          owner_id: laundry?.owner_id,
          status: laundry?.status || 'active'
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating laundry:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
      
      return new Response(
        JSON.stringify({ success: true, laundry: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } 
    else if (action === 'update') {
      // Update existing laundry
      if (!laundry?.id) {
        return new Response(
          JSON.stringify({ success: false, error: "ID is required for updating laundry" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      
      const { data, error } = await supabaseAdmin
        .from('laundries')
        .update({
          name: laundry.name,
          address: laundry.address,
          contact_phone: laundry.contact_phone,
          contact_email: laundry.contact_email,
          status: laundry.status,
          owner_id: laundry.owner_id
        })
        .eq('id', laundry.id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating laundry:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
      
      return new Response(
        JSON.stringify({ success: true, laundry: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } 
    else if (action === 'delete') {
      // Delete laundry
      if (!laundry?.id) {
        return new Response(
          JSON.stringify({ success: false, error: "ID is required for deleting laundry" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      
      // First check if laundry has any machines
      const { data: machines, error: checkError } = await supabaseAdmin
        .from('machines')
        .select('id')
        .eq('laundry_id', laundry.id)
        .limit(1);
      
      if (checkError) {
        console.error("Error checking machines:", checkError);
        return new Response(
          JSON.stringify({ success: false, error: checkError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
      
      if (machines && machines.length > 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Esta lavanderia possui máquinas registradas. Remova as máquinas primeiro." 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      
      const { error } = await supabaseAdmin
        .from('laundries')
        .delete()
        .eq('id', laundry.id);
      
      if (error) {
        console.error("Error deleting laundry:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    else if (action === 'list') {
      // List laundries with admin service role to bypass RLS
      let query = supabaseAdmin.from('laundries').select('*');
      
      // Only filter by owner_id if provided and not forcing to show all
      if (ownerId && !forceShowAll) {
        console.log(`Filtering laundries by owner_id: ${ownerId}`);
        query = query.eq('owner_id', ownerId);
      } else {
        console.log("Fetching all laundries (no owner filter or force show all)");
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error listing laundries:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
      
      return new Response(
        JSON.stringify({ success: true, laundries: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({ success: false, error: "Invalid action" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  } catch (error) {
    console.error("Error in manage-laundries function:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
