
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Machine } from "@/types";
import { sendMQTTCommand } from "./mqttService";

export async function sendCommandToMachine(machine: Machine, command: 'start' | 'stop' | 'status', duration?: number): Promise<boolean> {
  try {
    console.log(`Enviando comando ${command} para máquina ${machine.id} (ESP32)`);
    
    // Envia comando via MQTT
    const success = await sendMQTTCommand(machine, {
      command,
      duration
    });

    if (!success) {
      throw new Error('Falha ao enviar comando MQTT');
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
