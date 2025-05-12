
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Access the Supabase client through environment variables (set by Supabase Edge Functions)
    const supabaseClient = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseClient || !supabaseKey) {
      throw new Error('Missing Supabase client details');
    }
    
    // Create the SQL for the RPC function
    const rpcSql = `
    CREATE OR REPLACE FUNCTION public.list_business_owners()
    RETURNS TABLE (
      id uuid,
      name text,
      email text,
      phone text,
      role text
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        p.id,
        CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, '')) as name,
        p.contact_email as email,
        p.contact_phone as phone,
        p.role::text
      FROM 
        profiles p
      WHERE 
        p.role = 'business'::user_role;
    END;
    $$;
    
    -- Grant execute permission to authenticated users
    GRANT EXECUTE ON FUNCTION public.list_business_owners() TO authenticated;
    `;
    
    // Execute the SQL to create the function
    const response = await fetch(`${supabaseClient}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ sql_query: rpcSql })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create RPC function: ${errorText}`);
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'RPC function created successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in create-business-owners-rpc:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
