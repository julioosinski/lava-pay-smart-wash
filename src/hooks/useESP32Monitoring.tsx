import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkESP32Connection, getMachineDetailedStatus } from '@/services/esp32';

interface MachineStatus {
  isConnected: boolean;
  isUnlocked: boolean;
  remainingTime?: number;
  errorCode?: string;
  wifiSignal?: number;
}

export function useESP32Monitoring(machineId?: string) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [machineStatus, setMachineStatus] = useState<MachineStatus | null>(null);
  const [wifiSignal, setWifiSignal] = useState<number | null>(null);

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
    
    // Initial connection check
    checkConnection();
    
    // Set up periodic checking every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    // Set up real-time monitoring of machine status changes
    const channel = supabase
      .channel('machine-status-changes')
      .on(
        'postgres_changes' as unknown as 'system',
        {
          event: '*',
          schema: 'public',
          table: 'machines',
          filter: `id=eq.${machineId}`
        },
        (payload) => {
          console.log('Machine status changed:', payload);
          refreshMachineStatus();
        }
      )
      .subscribe();
    
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
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

  // Function to get detailed machine status
  const refreshMachineStatus = async () => {
    if (!machineId) return;
    
    try {
      const status = await getMachineDetailedStatus(machineId);
      setMachineStatus(status);
      setIsConnected(status.isConnected);
    } catch (error) {
      console.error('Erro ao obter status detalhado da máquina:', error);
      setMachineStatus(null);
    }
  };

  // Initial fetch of detailed status
  useEffect(() => {
    if (machineId) {
      refreshMachineStatus();
    }
  }, [machineId]);

  // Set up real-time monitoring of WiFi signal
  useEffect(() => {
    if (!machineId) return;
    
    const channel = supabase
      .channel('esp32-signal')
      .on(
        'broadcast',
        { event: 'wifi_signal' },
        (payload) => {
          if (payload.payload.machine_id === machineId) {
            setWifiSignal(payload.payload.signal);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [machineId]);

  return {
    isConnected,
    isChecking,
    machineStatus,
    wifiSignal,
    refreshConnectionStatus,
    refreshMachineStatus
  };
}
