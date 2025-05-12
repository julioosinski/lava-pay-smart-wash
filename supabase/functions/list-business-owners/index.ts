
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || '';
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    // Query profiles with role = 'business'
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, contact_email, contact_phone, role')
      .eq('role', 'business');

    if (error) {
      console.error("Error querying business owners:", error);
      throw error;
    }

    const businessOwners = (data || []).map(owner => ({
      id: owner.id,
      name: `${owner.first_name || ''} ${owner.last_name || ''}`.trim() || 'Sem nome',
      email: owner.contact_email || '',
      phone: owner.contact_phone || '',
      role: owner.role
    }));

    console.log(`Found ${businessOwners.length} business owners`);
    return new Response(
      JSON.stringify(businessOwners),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error("Error in list-business-owners function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
