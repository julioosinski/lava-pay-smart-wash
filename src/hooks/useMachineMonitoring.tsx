
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Machine } from "@/types";

interface RealtimePayload {
  new: Machine;
  old: Machine;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

export function useMachineMonitoring(laundryId?: string) {
  useEffect(() => {
    // Subscribe to machine status changes
    const channel = supabase
      .channel('machine-status-changes')
      .on(
        'postgres_changes' as unknown as 'system',
        {
          event: '*',
          schema: 'public',
          table: 'machines',
          filter: laundryId ? `laundry_id=eq.${laundryId}` : undefined
        },
        (payload: RealtimePayload) => {
          console.log('Machine status changed:', payload);
          
          if (payload.new.status === 'available') {
            toast.info(`Máquina #${payload.new.machine_number} está disponível`);
          } else if (payload.new.status === 'in-use') {
            toast.success(`Máquina #${payload.new.machine_number} iniciou operação`);
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [laundryId]);
}
