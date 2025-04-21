
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkESP32Connection } from '@/services/esp32Service';

export function useESP32Monitoring(machineId?: string) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Check initial ESP32 connection status
  useEffect(() => {
    if (!machineId) return;
    
    const checkConnection = async () => {
      setIsChecking(true);
      try {
        const connected = await checkESP32Connection(machineId);
        setIsConnected(connected);
        
        if (!connected) {
          toast.warning(`Máquina #${machineId} está offline. Verifique a conexão Wi-Fi.`);
        }
      } catch (error) {
        console.error('Erro ao verificar conexão ESP32:', error);
        setIsConnected(false);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkConnection();
    
    // Set up periodic checking every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, [machineId]);

  // Function to manually check connection
  const refreshConnectionStatus = async () => {
    if (!machineId || isChecking) return;
    
    setIsChecking(true);
    try {
      const connected = await checkESP32Connection(machineId);
      setIsConnected(connected);
      
      if (connected) {
        toast.success(`Máquina #${machineId} está online.`);
      } else {
        toast.warning(`Máquina #${machineId} está offline. Verifique a conexão Wi-Fi.`);
      }
    } catch (error) {
      console.error('Erro ao verificar conexão ESP32:', error);
      setIsConnected(false);
      toast.error('Erro ao verificar status da conexão.');
    } finally {
      setIsChecking(false);
    }
  };

  return {
    isConnected,
    isChecking,
    refreshConnectionStatus
  };
}
