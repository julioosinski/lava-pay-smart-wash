
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Machine } from "@/types";

export const useMachines = (laundryId?: string) => {
  return useQuery({
    queryKey: ['machines', laundryId],
    queryFn: async () => {
      try {
        const query = supabase
          .from('machines')
          .select('*')
          .order('created_at', { ascending: false });

        if (laundryId) {
          query.eq('laundry_id', laundryId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data || []) as Machine[];
      } catch (error) {
        console.error("Error fetching machines:", error);
        return [];
      }
    },
    enabled: !!true // Fix the excessive type instantiation by using a simple boolean
  });
};

type MachineInput = {
  type: 'washer' | 'dryer';
  price: number;
  laundry_id: string;
  time_minutes: number;
  machine_number: number;
};

export const useCreateMachine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (machine: MachineInput) => {
      console.log("Creating machine with data:", machine);
      
      // Validate required fields
      if (!machine.type || !machine.price || !machine.laundry_id || !machine.time_minutes || machine.machine_number === undefined) {
        throw new Error('Missing required fields');
      }
      
      const { data, error } = await supabase
        .from('machines')
        .insert({
          type: machine.type,
          price: machine.price,
          laundry_id: machine.laundry_id,
          time_minutes: machine.time_minutes,
          machine_number: machine.machine_number
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
      queryClient.invalidateQueries({ queryKey: ['machines', variables.laundry_id] });
      toast.success('Máquina removida com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover máquina: ' + error.message);
    }
  });
};
