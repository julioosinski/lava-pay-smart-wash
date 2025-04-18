
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Machine } from "@/types";

export const useMachines = (laundryId?: string) => {
  return useQuery({
    queryKey: ['machines', laundryId],
    queryFn: async () => {
      const query = supabase
        .from('machines')
        .select('*')
        .order('created_at', { ascending: false });

      if (laundryId) {
        query.eq('laundry_id', laundryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !laundryId || !!laundryId
  });
};

export const useCreateMachine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (machine: Omit<Machine, 'id'>) => {
      const { data, error } = await supabase
        .from('machines')
        .insert(machine)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['machines', variables.locationId] });
      toast.success('Máquina adicionada com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao adicionar máquina: ' + error.message);
    }
  });
};
