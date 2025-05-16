
import { supabase } from "@/integrations/supabase/client";
import { Machine } from "@/types";

export async function getMachineStatus(machineId: string): Promise<Machine | null> {
  try {
    // Use edge function to bypass RLS policies
    const { data, error } = await supabase.functions.invoke('manage-machines', {
      body: {
        action: 'list',
        machineId
      }
    });
    
    if (error || !data || data.error) {
      console.error('Erro ao obter status da máquina:', error || data?.error);
      return null;
    }
    
    const machines = data.machines || [];
    return machines.length > 0 ? machines[0] as Machine : null;
  } catch (error) {
    console.error('Erro ao obter status da máquina:', error);
    return null;
  }
}

export async function updateMachineStatus(machineId: string, status: 'available' | 'in-use' | 'maintenance', paymentId?: string): Promise<boolean> {
  try {
    const updateData: any = { status };
    
    if (status === 'in-use' && paymentId) {
      // Busca informações da máquina para calcular expected_end_time
      const machineInfo = await getMachineStatus(machineId);
      
      const now = new Date();
      const timeMinutes = machineInfo?.time_minutes || 30; // Default de 30 min se não encontrar
      const endTime = new Date(now.getTime() + (timeMinutes * 60 * 1000));
      
      updateData.current_payment_id = paymentId;
      updateData.current_session_start = now.toISOString();
      updateData.expected_end_time = endTime.toISOString();
    } else if (status === 'available') {
      updateData.current_payment_id = null;
      updateData.current_session_start = null;
      updateData.expected_end_time = null;
    }
    
    // Use edge function to bypass RLS policies
    const { data, error } = await supabase.functions.invoke('manage-machines', {
      body: {
        action: 'update',
        machine: {
          id: machineId,
          ...updateData
        }
      }
    });
    
    if (error || !data || data.error) {
      console.error('Erro ao atualizar status da máquina:', error || data?.error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status da máquina:', error);
    return false;
  }
}

export async function getMachinesByLaundry(laundryId: string): Promise<Machine[]> {
  try {
    // Use edge function to bypass RLS policies
    const { data, error } = await supabase.functions.invoke('manage-machines', {
      body: {
        action: 'list',
        laundryId
      }
    });
    
    if (error || !data || data.error) {
      console.error('Erro ao obter máquinas da lavanderia:', error || data?.error);
      return [];
    }
    
    return (data.machines || []) as Machine[];
  } catch (error) {
    console.error('Erro ao obter máquinas da lavanderia:', error);
    return [];
  }
}
