
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLaundries = () => {
  return useQuery({
    queryKey: ['laundries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('laundries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });
};

export const useCreateLaundry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (laundry: { name: string; address: string; owner_id: string }) => {
      const { data, error } = await supabase
        .from('laundries')
        .insert(laundry)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundries'] });
      toast.success('Lavanderia criada com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar lavanderia: ' + error.message);
    }
  });
};
