
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LaundryLocation } from "@/types";

export function useLaundries() {
  return useQuery({
    queryKey: ['laundries'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('laundries')
          .select('*');
        
        if (error) {
          console.error("Error fetching laundries:", error);
          throw error;
        }
        
        return data as LaundryLocation[];
      } catch (error) {
        console.error("Error in useLaundries hook:", error);
        return [];
      }
    }
  });
}

export function useCreateLaundry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (laundry: Omit<LaundryLocation, 'id' | 'machines'>) => {
      console.log("Creating laundry with data:", laundry);
      const { data, error } = await supabase
        .from('laundries')
        .insert(laundry)
        .select()
        .single();

      if (error) {
        console.error("Supabase error creating laundry:", error);
        throw error;
      }
      
      console.log("Laundry created successfully:", data);
      return data as LaundryLocation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundries'] });
      toast.success('Lavanderia criada com sucesso');
    },
    onError: (error: Error) => {
      console.error("Error in mutation:", error);
      toast.error('Erro ao criar lavanderia: ' + error.message);
    }
  });
}
