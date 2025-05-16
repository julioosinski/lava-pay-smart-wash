
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Machine } from "@/types";

export const useMachines = (laundryId?: string) => {
  return useQuery({
    queryKey: ['machines', laundryId],
    queryFn: async () => {
      try {
        console.log("Fetching machines for laundryId:", laundryId);
        
        // Use edge function to bypass RLS policies
        const { data, error } = await supabase.functions.invoke('manage-machines', {
          body: {
            action: 'list',
            laundryId: laundryId,
            includeAll: laundryId === 'all'
          }
        });
        
        if (error) {
          console.error("Error fetching machines:", error);
          throw error;
        }
        
        if (!data || data.error) {
          console.error("Service error fetching machines:", data?.error || "Unknown error");
          throw new Error(`Erro ao buscar máquinas: ${data?.error || "Erro desconhecido"}`);
        }
        
        console.log(`Fetched ${data.machines?.length || 0} machines:`, data.machines);
        return (data.machines || []) as Machine[];
      } catch (error) {
        console.error("Error in useMachines hook:", error);
        throw error;
      }
    },
    enabled: true // Always enable the query to ensure data is fetched
  });
};

type MachineInput = {
  type: 'washer' | 'dryer';
  price: number;
  laundry_id: string;
  time_minutes: number;
  machine_number: number;
  mqtt_broker?: string;
  mqtt_username?: string;
  mqtt_password?: string;
  wifi_ssid?: string;
  wifi_password?: string;
};

export const useCreateMachine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (machine: MachineInput) => {
      console.log("Creating machine with data:", machine);
      
      // Validate required fields
      if (!machine.type || !machine.price || !machine.laundry_id || !machine.time_minutes || 
          machine.machine_number === undefined) {
        throw new Error('Missing required fields');
      }
      
      // Generate default values for store_id and machine_serial since they're required by the database
      const store_id = `STORE-${machine.machine_number}`;
      const machine_serial = `SERIAL-${machine.machine_number}`;
      
      try {
        // Use edge function to bypass RLS policies
        const { data, error } = await supabase.functions.invoke('manage-machines', {
          body: {
            action: 'create',
            machine: {
              ...machine,
              store_id,
              machine_serial
            }
          }
        });
        
        if (error) {
          console.error("Error creating machine:", error);
          throw error;
        }
        
        if (!data || data.error) {
          console.error("Service error creating machine:", data?.error || "Unknown error");
          throw new Error(`Erro ao criar máquina: ${data?.error || "Erro desconhecido"}`);
        }
        
        console.log("Machine created successfully:", data.machine);
        return data.machine as Machine;
      } catch (error: any) {
        console.error("Error creating machine:", error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      queryClient.invalidateQueries({ queryKey: ['machines', variables.laundry_id] });
      toast.success('Máquina adicionada com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao adicionar máquina: ' + error.message);
    }
  });
};

export const useDeleteMachine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, laundry_id }: { id: string, laundry_id: string }) => {
      try {
        // Use edge function to bypass RLS policies
        const { data, error } = await supabase.functions.invoke('manage-machines', {
          body: {
            action: 'delete',
            machineId: id
          }
        });
        
        if (error) {
          console.error("Error deleting machine:", error);
          throw error;
        }
        
        if (!data || data.error) {
          console.error("Service error deleting machine:", data?.error || "Unknown error");
          throw new Error(`Erro ao excluir máquina: ${data?.error || "Erro desconhecido"}`);
        }
        
        return id;
      } catch (error: any) {
        console.error("Error deleting machine:", error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      queryClient.invalidateQueries({ queryKey: ['machines', variables.laundry_id] });
      toast.success('Máquina removida com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover máquina: ' + error.message);
    }
  });
};

export const useUpdateMachine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (machine: Partial<Machine> & { id: string, laundry_id: string }) => {
      console.log("Updating machine with data:", machine);
      
      try {
        // Use edge function to bypass RLS policies
        const { data, error } = await supabase.functions.invoke('manage-machines', {
          body: {
            action: 'update',
            machine
          }
        });
        
        if (error) {
          console.error("Error updating machine:", error);
          throw error;
        }
        
        if (!data || data.error) {
          console.error("Service error updating machine:", data?.error || "Unknown error");
          throw new Error(`Erro ao atualizar máquina: ${data?.error || "Erro desconhecido"}`);
        }
        
        console.log("Machine updated successfully:", data.machine);
        return data.machine as Machine;
      } catch (error: any) {
        console.error("Error updating machine:", error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      queryClient.invalidateQueries({ queryKey: ['machines', variables.laundry_id] });
      toast.success('Máquina atualizada com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar máquina: ' + error.message);
    }
  });
};
