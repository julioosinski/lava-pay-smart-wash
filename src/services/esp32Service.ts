
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Machine } from "@/types";

interface ESP32Command {
  command: 'start' | 'stop' | 'status';
  machineId: string;
  duration?: number;
}

// Simula o envio de comandos para o ESP32 da máquina
// Em um ambiente real, isso seria substituído por uma API REST ou WebSockets
export async function sendCommandToMachine(machine: Machine, command: ESP32Command['command'], duration?: number): Promise<boolean> {
  try {
    console.log(`Enviando comando ${command} para máquina ${machine.id} (ESP32)`);
    
    // Em um cenário real, aqui faria uma chamada para uma API que se comunica com o ESP32
    // Por exemplo:
    // const response = await fetch(`https://api.lavapay.com/machines/${machine.id}/command`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ command, duration })
    // });
    
    // Simulação do envio bem-sucedido do comando
    // Como a tabela machine_commands ainda não existe no banco, vamos apenas
    // registrar o evento no console por enquanto
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
    } else if (command === 'stop') {
      await supabase
        .from('machines')
        .update({ 
          status: 'available',
          current_session_start: null,
          current_payment_id: null
        })
        .eq('id', machine.id);
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
    // Em um cenário real, aqui verificaria se o ESP32 está online
    // Por exemplo:
    // const response = await fetch(`https://api.lavapay.com/machines/${machineId}/ping`, {
    //   method: 'GET'
    // });
    // return response.ok;
    
    // Simulação: considera 90% das máquinas como online
    return Math.random() > 0.1;
  } catch (error) {
    console.error('Erro ao verificar conexão do ESP32:', error);
    return false;
  }
}
