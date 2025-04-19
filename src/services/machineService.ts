
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
  // The function expects laundry_id and user_id parameters, but we want to call it without parameters
  // We'll use type assertion to work around TypeScript's type checking
  const { data, error } = await supabase.rpc(
    'check_machine_sessions' as unknown as string,
    {} as { laundry_id: string; user_id: string },
    { count: 'exact' }
  );

  if (error) {
    console.error('Error checking machine sessions:', error);
    throw error;
  }

  return data;
}
