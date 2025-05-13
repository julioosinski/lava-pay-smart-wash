
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Using service role key allows us to bypass RLS policies
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, first_name, last_name, contact_email, contact_phone, role')
      .eq('role', 'business');

    if (error) {
      console.error("Error fetching business owners:", error);
      throw error;
    }
    
    // Format the response to match the BusinessOwner type
    const businessOwners = data.map(profile => ({
      id: profile.id,
      name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Sem nome',
      email: profile.contact_email || '',
      phone: profile.contact_phone || '',
      role: profile.role
    }));

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
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to fetch business owners" 
      }),
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
