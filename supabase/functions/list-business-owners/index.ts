
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase client using service role key for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || '';
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    // Retrieve user info from the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid authorization token');
    }
    
    // Check if user is admin using our security definer function
    const { data: isAdminData, error: isAdminError } = await supabase.rpc('is_user_admin');
    
    if (isAdminError) {
      console.error('Error checking admin status:', isAdminError);
    }
    
    const isAdmin = isAdminData === true;
    
    if (!isAdmin) {
      throw new Error('Only admins can access this function');
    }
    
    // Query profiles with role = 'business' using the service role key
    // This bypasses RLS policies
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, contact_email, contact_phone, role')
      .eq('role', 'business');

    if (error) {
      throw error;
    }

    // Format the business owners data for the frontend
    const businessOwners = data.map(owner => ({
      id: owner.id,
      name: `${owner.first_name || ''} ${owner.last_name || ''}`.trim() || 'Sem nome',
      email: owner.contact_email || '',
      phone: owner.contact_phone || '',
      role: owner.role
    }));

    return new Response(
      JSON.stringify(businessOwners),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in list-business-owners function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
