
import { supabase } from "@/integrations/supabase/client";
import { Machine } from "@/types";
import { checkESP32Connection } from "./esp32Service";

export async function getMachineStatus(machineId: string): Promise<Machine | null> {
  try {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .eq('id', machineId)
      .single();

    if (error) {
      console.error('Error fetching machine status:', error);
      return null;
    }

    // Verify ESP32 connection status
    const isConnected = await checkESP32Connection(machineId);
    
    // Ensure the type is correctly cast to 'washer' or 'dryer'
    if (data) {
      const machineData = {
        ...data,
        type: data.type === 'washer' ? 'washer' : 'dryer',
        esp32_connected: isConnected // Add ESP32 connection status
      } as Machine & { esp32_connected: boolean };
      
      return machineData;
    }
    
    return null;
  } catch (error) {
    console.error('Error in getMachineStatus:', error);
    return null;
  }
}

export async function checkMachineSessions() {
  // Use type assertion to bypass TypeScript's restriction on RPC function names
  const { data, error } = await (supabase.rpc as any)(
    'check_machine_sessions',
    {},
    { count: 'exact' }
  );

  if (error) {
    console.error('Error checking machine sessions:', error);
    throw error;
  }

  return data;
}

// Start a machine operation after payment is confirmed
export async function startMachineOperation(machineId: string, paymentId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('machines')
      .update({ 
        status: 'in-use',
        current_session_start: new Date().toISOString(),
        current_payment_id: paymentId 
      })
      .eq('id', machineId)
      .select()
      .single();
      
    if (error) {
      console.error('Error starting machine operation:', error);
      return false;
    }
    
    // In a real scenario, here would be the code to actually signal the ESP32
    // to start the machine operation
    
    return true;
  } catch (error) {
    console.error('Error in startMachineOperation:', error);
    return false;
  }
}
