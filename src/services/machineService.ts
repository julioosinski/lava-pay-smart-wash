
import { supabase } from "@/integrations/supabase/client";
import { Machine } from "@/types";

export async function getMachineStatus(machineId: string): Promise<Machine | null> {
  try {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .eq('id', machineId)
      .single();
      
    if (error) {
      console.error('Erro ao obter status da máquina:', error);
      return null;
    }
    
    return data as Machine;
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
      const { data: machineData } = await supabase
        .from('machines')
        .select('time_minutes')
        .eq('id', machineId)
        .single();
      
      const now = new Date();
      const timeMinutes = machineData?.time_minutes || 30; // Default de 30 min se não encontrar
      const endTime = new Date(now.getTime() + (timeMinutes * 60 * 1000));
      
      updateData.current_payment_id = paymentId;
      updateData.current_session_start = now.toISOString();
      updateData.expected_end_time = endTime.toISOString();
    } else if (status === 'available') {
      updateData.current_payment_id = null;
      updateData.current_session_start = null;
      updateData.expected_end_time = null;
    }
    
    const { error } = await supabase
      .from('machines')
      .update(updateData)
      .eq('id', machineId);
      
    if (error) {
      console.error('Erro ao atualizar status da máquina:', error);
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
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .eq('laundry_id', laundryId)
      .order('machine_number', { ascending: true });
      
    if (error) {
      console.error('Erro ao obter máquinas da lavanderia:', error);
      return [];
    }
    
    return data as Machine[];
  } catch (error) {
    console.error('Erro ao obter máquinas da lavanderia:', error);
    return [];
  }
}
