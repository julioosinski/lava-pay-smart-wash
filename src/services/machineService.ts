
import { supabase } from "@/integrations/supabase/client";
import { Machine } from "@/types";

export async function getMachineStatus(machineId: string): Promise<Machine | null> {
  const { data, error } = await supabase
    .from('machines')
    .select('*')
    .eq('id', machineId)
    .single();

  if (error) {
    console.error('Error fetching machine status:', error);
    return null;
  }

  // Ensure the type is correctly cast to 'washer' or 'dryer'
  if (data) {
    const machineData = {
      ...data,
      type: data.type === 'washer' ? 'washer' : 'dryer'
    } as Machine;
    
    return machineData;
  }
  
  return null;
}

export async function checkMachineSessions() {
  const { data, error } = await supabase.rpc(
    'check_machine_sessions' as 'has_laundry_access',
    {}, 
    { count: 'exact' }
  );

  if (error) {
    console.error('Error checking machine sessions:', error);
    throw error;
  }

  return data;
}
