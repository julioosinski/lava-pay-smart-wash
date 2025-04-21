
import { checkESP32Connection, isMachineUnlocked } from "./connectionService";
import { supabase } from "@/integrations/supabase/client";

export interface MachineStatus {
  isConnected: boolean;
  isUnlocked: boolean;
  remainingTime?: number;
  errorCode?: string;
}

export async function getMachineDetailedStatus(machineId: string): Promise<MachineStatus> {
  try {
    const isConnected = await checkESP32Connection(machineId);
    
    if (!isConnected) {
      return {
        isConnected: false,
        isUnlocked: false
      };
    }
    
    const isUnlocked = await isMachineUnlocked(machineId);
    
    const { data, error } = await supabase
      .from('machines')
      .select('current_session_start, time_minutes, expected_end_time')
      .eq('id', machineId)
      .single();
    
    if (error) {
      console.error("Erro ao obter dados da máquina:", error);
      return {
        isConnected,
        isUnlocked,
        errorCode: 'DATABASE_ERROR'
      };
    }
    
    let remainingTime: number | undefined = undefined;
    
    if (data && data.current_session_start && isUnlocked) {
      if (data.expected_end_time) {
        const endTime = new Date(data.expected_end_time);
        remainingTime = Math.max(0, (endTime.getTime() - Date.now()) / 1000);
      } else if (data.time_minutes) {
        const startTime = new Date(data.current_session_start);
        const totalDuration = data.time_minutes * 60 * 1000;
        const elapsedTime = Date.now() - startTime.getTime();
        remainingTime = Math.max(0, (totalDuration - elapsedTime) / 1000);
      }
    }
    
    return {
      isConnected,
      isUnlocked,
      remainingTime
    };
  } catch (error) {
    console.error('Erro ao obter status detalhado da máquina:', error);
    return {
      isConnected: false,
      isUnlocked: false,
      errorCode: 'COMMUNICATION_ERROR'
    };
  }
}
