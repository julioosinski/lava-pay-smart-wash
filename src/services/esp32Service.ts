
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
    
    // Simulação do envio bem-sucedido do comando
    // Registrando o comando no console para debug
    console.log('Comando enviado:', {
      machine_id: machine.id,
      command,
      duration,
      timestamp: new Date().toISOString(),
      status: 'sent'
    });
    
    // Atualiza o status da máquina conforme o comando
    if (command === 'start') {
      await supabase
        .from('machines')
        .update({ 
          status: 'in-use',
          current_session_start: new Date().toISOString()
        })
        .eq('id', machine.id);
        
      console.log(`Máquina ${machine.id} iniciada com sucesso. Duração: ${duration} segundos`);
    } else if (command === 'stop') {
      await supabase
        .from('machines')
        .update({ 
          status: 'available',
          current_session_start: null,
          current_payment_id: null
        })
        .eq('id', machine.id);
        
      console.log(`Máquina ${machine.id} parada com sucesso`);
    }
    
    // Poderia registrar o comando em uma tabela machine_commands para histórico
    // Na implementação atual, estamos apenas simulando
    
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
    const { data } = await supabase
      .from('machines')
      .select('current_session_start, time_minutes')
      .eq('id', machineId)
      .single();
    
    let remainingTime: number | undefined = undefined;
    
    if (data?.current_session_start && isUnlocked) {
      const startTime = new Date(data.current_session_start);
      const totalDuration = data.time_minutes * 60 * 1000; // em milissegundos
      const elapsedTime = Date.now() - startTime.getTime();
      remainingTime = Math.max(0, (totalDuration - elapsedTime) / 1000); // em segundos
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
