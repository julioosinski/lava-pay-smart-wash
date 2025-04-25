
import { supabase } from "@/integrations/supabase/client";
import { Machine } from "@/types";
import { toast } from "sonner";

interface MQTTCommand {
  command: 'start' | 'stop' | 'status' | 'config';
  duration?: number;
  wifi_ssid?: string;
  wifi_password?: string;
  mqtt_broker?: string;
  mqtt_username?: string;
  mqtt_password?: string;
}

export async function sendMQTTCommand(machine: Machine, command: MQTTCommand): Promise<boolean> {
  try {
    const topic = `machine/${machine.id}/command`;
    
    // Em um ambiente real, isso enviaria o comando via MQTT
    // Por enquanto, simularemos enviando para o Supabase
    const { error } = await supabase
      .from('machine_commands')
      .insert({
        machine_id: machine.id,
        command: command.command,
        params: command,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

    if (error) throw error;
    console.log(`MQTT command sent to ${topic}:`, command);
    return true;
  } catch (error) {
    console.error('Error sending MQTT command:', error);
    toast.error('Erro ao enviar comando para a máquina');
    return false;
  }
}

export async function updateESP32Config(machine: Machine): Promise<boolean> {
  try {
    // Busca as configurações ESP32 da lavanderia
    const { data: settings, error } = await supabase
      .from('esp32_settings')
      .select('*')
      .eq('laundry_id', machine.laundry_id)
      .single();

    if (error) throw error;
    if (!settings) throw new Error('Configurações ESP32 não encontradas');

    const configCommand: MQTTCommand = {
      command: 'config',
      wifi_ssid: settings.wifi_ssid || undefined,
      wifi_password: settings.wifi_password || undefined,
      mqtt_broker: settings.mqtt_broker || undefined,
      mqtt_username: settings.mqtt_username || undefined,
      mqtt_password: settings.mqtt_password || undefined
    };

    return sendMQTTCommand(machine, configCommand);
  } catch (error) {
    console.error('Error updating ESP32 config:', error);
    toast.error('Erro ao atualizar configuração do ESP32');
    return false;
  }
}
