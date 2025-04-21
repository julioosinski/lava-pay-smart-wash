
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Machine } from "@/types";

interface ESP32Command {
  command: 'start' | 'stop' | 'status';
  machineId: string;
  duration?: number;
}

interface MachineCommand {
  machine_id: string;
  command: string;
  params?: Record<string, any>;
  sent_at: string;
  status: 'sent' | 'received' | 'error';
  error_message?: string;
}

// Função para enviar comandos para o ESP32 da máquina
export async function sendCommandToMachine(machine: Machine, command: ESP32Command['command'], duration?: number): Promise<boolean> {
  try {
    console.log(`Enviando comando ${command} para máquina ${machine.id} (ESP32)`);
    
    // Em um ambiente real, aqui faria uma chamada para uma API que se comunica com o ESP32
    // Por exemplo:
    // const response = await fetch(`https://api.lavapay.com/machines/${machine.id}/command`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ command, duration })
    // });
    
    // Registra o comando no histórico
    const commandParams = duration ? { duration } : {};
    
    try {
      const { error } = await supabase
        .from('machine_commands')
        .insert({
          machine_id: machine.id,
          command,
          params: commandParams,
          status: 'sent'
        });
        
      if (error) console.error('Erro ao registrar comando:', error);
    } catch (e) {
      // Se a tabela não existir ainda, apenas seguimos em frente
      console.warn('Não foi possível registrar o comando no histórico:', e);
    }
    
    // Atualiza o status da máquina conforme o comando
    if (command === 'start') {
      const now = new Date();
      const endTime = new Date(now.getTime() + (machine.time_minutes * 60 * 1000));
      
      await supabase
        .from('machines')
        .update({ 
          status: 'in-use',
          current_session_start: now.toISOString(),
          expected_end_time: endTime.toISOString()
        })
        .eq('id', machine.id);
        
      console.log(`Máquina ${machine.id} iniciada com sucesso. Duração: ${machine.time_minutes} minutos`);
    } else if (command === 'stop') {
      await supabase
        .from('machines')
        .update({ 
          status: 'available',
          current_session_start: null,
          current_payment_id: null,
          expected_end_time: null
        })
        .eq('id', machine.id);
        
      console.log(`Máquina ${machine.id} parada com sucesso`);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao enviar comando para ESP32:', error);
    toast.error('Falha na comunicação com a máquina');
    return false;
  }
}

// Verifica o status de conexão do ESP32
export async function checkESP32Connection(machineId: string): Promise<boolean> {
  try {
    console.log(`Verificando conexão da máquina ${machineId}`);
    
    // Em um cenário real, aqui verificaria se o ESP32 está online
    // Por exemplo:
    // const response = await fetch(`https://api.lavapay.com/machines/${machineId}/ping`, {
    //   method: 'GET'
    // });
    // return response.ok;
    
    // Simulação: considera 90% das máquinas como online
    const isConnected = Math.random() > 0.1;
    console.log(`Máquina ${machineId} está ${isConnected ? 'online' : 'offline'}`);
    return isConnected;
  } catch (error) {
    console.error('Erro ao verificar conexão do ESP32:', error);
    return false;
  }
}

// Verifica se a máquina está liberada para uso
export async function isMachineUnlocked(machineId: string): Promise<boolean> {
  try {
    // Em um cenário real, verificaria o status real da máquina via ESP32
    // Por enquanto, verificamos pelo status no banco
    const { data, error } = await supabase
      .from('machines')
      .select('status')
      .eq('id', machineId)
      .single();
      
    if (error) throw error;
    
    // Uma máquina está "desbloqueada" se estiver em uso
    return data?.status === 'in-use';
  } catch (error) {
    console.error('Erro ao verificar se máquina está desbloqueada:', error);
    return false;
  }
}

// Obtém informações detalhadas do status da máquina
export async function getMachineDetailedStatus(machineId: string): Promise<{
  isConnected: boolean;
  isUnlocked: boolean;
  remainingTime?: number;
  errorCode?: string;
}> {
  try {
    // Verifica conexão
    const isConnected = await checkESP32Connection(machineId);
    
    if (!isConnected) {
      return {
        isConnected: false,
        isUnlocked: false
      };
    }
    
    // Verifica se está desbloqueada
    const isUnlocked = await isMachineUnlocked(machineId);
    
    // Em um cenário real, essa informação viria do próprio ESP32
    // Por enquanto, simulamos baseado no status do banco
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
      // Se temos expected_end_time, calculamos baseado nele
      if (data.expected_end_time) {
        const endTime = new Date(data.expected_end_time);
        remainingTime = Math.max(0, (endTime.getTime() - Date.now()) / 1000); // em segundos
      } 
      // Senão calculamos baseado no start time e duração
      else if (data.time_minutes) {
        const startTime = new Date(data.current_session_start);
        const totalDuration = data.time_minutes * 60 * 1000; // em milissegundos
        const elapsedTime = Date.now() - startTime.getTime();
        remainingTime = Math.max(0, (totalDuration - elapsedTime) / 1000); // em segundos
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
