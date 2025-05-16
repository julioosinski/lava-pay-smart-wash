
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1"

interface MachineInput {
  type: 'washer' | 'dryer';
  price: number;
  laundry_id: string;
  time_minutes: number;
  machine_number: number;
  mqtt_broker?: string;
  mqtt_username?: string;
  mqtt_password?: string;
  wifi_ssid?: string;
  wifi_password?: string;
  store_id: string;
  machine_serial: string;
  id?: string;
  status?: string;
}

interface ActionRequest {
  action: 'create' | 'update' | 'delete' | 'list';
  machine?: MachineInput;
  laundryId?: string;
  machineId?: string;
  includeAll?: boolean;
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
    const { action, machine, laundryId, machineId, includeAll } = requestData
    
    console.log(`User ${user.id} performing machine action: ${action}`)
    
    if (action === 'create') {
      // Create new machine using service role to bypass RLS
      if (!machine) {
        return new Response(
          JSON.stringify({ success: false, error: "Machine data is required" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      
      const { data, error } = await supabaseAdmin
        .from('machines')
        .insert({
          type: machine.type,
          price: machine.price,
          laundry_id: machine.laundry_id,
          time_minutes: machine.time_minutes,
          machine_number: machine.machine_number,
          mqtt_broker: machine.mqtt_broker,
          mqtt_username: machine.mqtt_username,
          mqtt_password: machine.mqtt_password,
          wifi_ssid: machine.wifi_ssid,
          wifi_password: machine.wifi_password,
          store_id: machine.store_id,
          machine_serial: machine.machine_serial,
          status: machine.status || 'available'
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating machine:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
      
      return new Response(
        JSON.stringify({ success: true, machine: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } 
    else if (action === 'update') {
      // Update existing machine
      if (!machine?.id) {
        return new Response(
          JSON.stringify({ success: false, error: "ID is required for updating machine" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      
      const updateData: any = {};
      
      // Only include fields that are defined
      if (machine.type !== undefined) updateData.type = machine.type;
      if (machine.price !== undefined) updateData.price = machine.price;
      if (machine.time_minutes !== undefined) updateData.time_minutes = machine.time_minutes;
      if (machine.machine_number !== undefined) updateData.machine_number = machine.machine_number;
      if (machine.mqtt_broker !== undefined) updateData.mqtt_broker = machine.mqtt_broker;
      if (machine.mqtt_username !== undefined) updateData.mqtt_username = machine.mqtt_username;
      if (machine.mqtt_password !== undefined) updateData.mqtt_password = machine.mqtt_password;
      if (machine.wifi_ssid !== undefined) updateData.wifi_ssid = machine.wifi_ssid;
      if (machine.wifi_password !== undefined) updateData.wifi_password = machine.wifi_password;
      if (machine.status !== undefined) updateData.status = machine.status;
      
      const { data, error } = await supabaseAdmin
        .from('machines')
        .update(updateData)
        .eq('id', machine.id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating machine:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
      
      return new Response(
        JSON.stringify({ success: true, machine: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } 
    else if (action === 'delete') {
      // Delete machine
      if (!machineId) {
        return new Response(
          JSON.stringify({ success: false, error: "Machine ID is required for deletion" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      
      const { error } = await supabaseAdmin
        .from('machines')
        .delete()
        .eq('id', machineId);
      
      if (error) {
        console.error("Error deleting machine:", error);
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
      // List machines with admin service role to bypass RLS
      let query = supabaseAdmin.from('machines').select('*').order('machine_number', { ascending: true });
      
      // Only filter by laundry_id if provided and not forcing to show all
      if (laundryId && !includeAll && laundryId !== 'all') {
        console.log(`Filtering machines by laundry_id: ${laundryId}`);
        query = query.eq('laundry_id', laundryId);
      } else {
        console.log("Fetching all machines (no laundry filter or include all)");
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error listing machines:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
      
      return new Response(
        JSON.stringify({ success: true, machines: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({ success: false, error: "Invalid action" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  } catch (error) {
    console.error("Error in manage-machines function:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
