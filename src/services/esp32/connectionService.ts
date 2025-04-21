
import { supabase } from "@/integrations/supabase/client";

export async function checkESP32Connection(machineId: string): Promise<boolean> {
  try {
    console.log(`Verificando conexão da máquina ${machineId}`);
    
    // Em um cenário real, aqui verificaria se o ESP32 está online
    // Simulação: considera 90% das máquinas como online
    const isConnected = Math.random() > 0.1;
    console.log(`Máquina ${machineId} está ${isConnected ? 'online' : 'offline'}`);
    return isConnected;
  } catch (error) {
    console.error('Erro ao verificar conexão do ESP32:', error);
    return false;
  }
}

export async function isMachineUnlocked(machineId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('machines')
      .select('status')
      .eq('id', machineId)
      .single();
      
    if (error) throw error;
    return data?.status === 'in-use';
  } catch (error) {
    console.error('Erro ao verificar se máquina está desbloqueada:', error);
    return false;
  }
}
