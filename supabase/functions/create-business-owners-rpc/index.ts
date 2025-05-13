
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

    // Create the get_business_owners RPC function
    const { error } = await supabase.rpc('create_get_business_owners_function');

    if (error) {
      console.error('Error creating RPC function:', error);
      throw error;
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'RPC function created successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in create-business-owners-rpc function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
