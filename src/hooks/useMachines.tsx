
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
        let query = supabase
          .from('machines')
          .select('*')
          .order('machine_number', { ascending: true });

        // Only filter by laundry_id if provided and not 'all'
        if (laundryId && laundryId !== 'all') {
          console.log("Filtering machines by laundry_id:", laundryId);
          query = query.eq('laundry_id', laundryId);
        } else {
          console.log("No laundry filter applied, fetching all machines");
        }

        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching machines:", error);
          throw error;
        }
        
        console.log(`Fetched ${data?.length || 0} machines:`, data);
        return (data || []) as Machine[];
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
      
      const { data, error } = await supabase
        .from('machines')
        .insert({
          type: machine.type,
          price: machine.price,
          laundry_id: machine.laundry_id,
          time_minutes: machine.time_minutes,
          machine_number: machine.machine_number,
          mqtt_broker: machine.mqtt_broker,
          mqtt_username: machine.mqtt_username,
          mqtt_password: machine.mqtt_password,
          wifi_ssid: machine.wifi_ssid,
          wifi_password: machine.wifi_password,
          // Add required fields with default values
          store_id: store_id,
          machine_serial: machine_serial
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating machine:", error);
        throw error;
      }
      
      console.log("Machine created successfully:", data);
      return data as Machine;
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
      const { error } = await supabase
        .from('machines')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting machine:", error);
        throw error;
      }
      
      return id;
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
      
      const { data, error } = await supabase
        .from('machines')
        .update({
          type: machine.type,
          price: machine.price,
          time_minutes: machine.time_minutes,
          machine_number: machine.machine_number,
          mqtt_broker: machine.mqtt_broker,
          mqtt_username: machine.mqtt_username,
          mqtt_password: machine.mqtt_password,
          wifi_ssid: machine.wifi_ssid,
          wifi_password: machine.wifi_password
          // We don't need to update store_id and machine_serial as they already exist in the database
        })
        .eq('id', machine.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating machine:", error);
        throw error;
      }
      
      console.log("Machine updated successfully:", data);
      return data as Machine;
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
