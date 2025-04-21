
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Machine } from "@/types";

interface ESP32Command {
  command: 'start' | 'stop' | 'status';
  machineId: string;
  duration?: number;
}

export async function sendCommandToMachine(machine: Machine, command: ESP32Command['command'], duration?: number): Promise<boolean> {
  try {
    console.log(`Enviando comando ${command} para máquina ${machine.id} (ESP32)`);
    
    const commandParams = duration ? { duration } : {};
    
    try {
      const { error } = await (supabase
        .from('machine_commands' as any)
        .insert({
          machine_id: machine.id,
          command,
          params: commandParams,
          status: 'sent',
          sent_at: new Date().toISOString()
        } as any));
        
      if (error) console.error('Erro ao registrar comando:', error);
    } catch (e) {
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
