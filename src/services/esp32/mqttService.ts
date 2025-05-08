
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
    // Define o tópico MQTT específico para a máquina
    const topic = `machine/${machine.id}/command`;
    
    // Em um ambiente real, aqui você usaria uma biblioteca MQTT para publicar a mensagem
    // Por exemplo, usando o MQTT.js:
    // const client = await mqtt.connectAsync(`mqtt://${machine.mqtt_broker}`, {
    //   username: machine.mqtt_username,
    //   password: machine.mqtt_password
    // });
    // await client.publish(topic, JSON.stringify(command));
    // await client.end();
    
    // Por enquanto, apenas logamos o comando que seria enviado
    console.log(`MQTT command would be sent to ${machine.mqtt_broker} on topic ${topic}:`, command);
    
    // Atualiza o status da máquina se necessário
    if (command.command === 'start' || command.command === 'stop') {
      const { error } = await supabase
        .from('machines')
        .update({ 
          status: command.command === 'start' ? 'in-use' : 'available'
        })
        .eq('id', machine.id);
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error sending MQTT command:', error);
    toast.error('Erro ao enviar comando para a máquina');
    return false;
  }
}

export async function updateESP32Config(machine: Machine): Promise<boolean> {
  try {
    // Verifica se as configurações MQTT estão presentes
    if (!machine.mqtt_broker || !machine.mqtt_username || !machine.mqtt_password) {
      toast.error('Configurações MQTT não encontradas');
      return false;
    }

    const configCommand: MQTTCommand = {
      command: 'config',
      wifi_ssid: machine.wifi_ssid || undefined,
      wifi_password: machine.wifi_password || undefined,
      mqtt_broker: machine.mqtt_broker,
      mqtt_username: machine.mqtt_username,
      mqtt_password: machine.mqtt_password
    };

    return sendMQTTCommand(machine, configCommand);
  } catch (error) {
    console.error('Error updating ESP32 config:', error);
    toast.error('Erro ao atualizar configuração do ESP32');
    return false;
  }
}
