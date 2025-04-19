
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

  return data;
}

export async function checkMachineSessions() {
  const { data, error } = await supabase
    .rpc('check_machine_sessions');

  if (error) {
    console.error('Error checking machine sessions:', error);
    throw error;
  }

  return data;
}
