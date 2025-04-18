
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export function useDeleteLaundry() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (laundryId: string) => {
      if (!session) {
        throw new Error('Você precisa estar autenticado para excluir uma lavanderia');
      }
      
      console.log(`Deleting laundry with ID: ${laundryId}`);
      
      // First, delete all machines associated with this laundry
      const { error: machinesError } = await supabase
        .from('machines')
        .delete()
        .eq('laundry_id', laundryId);

      if (machinesError) {
        console.error("Error deleting machines:", machinesError);
        throw new Error(`Erro ao excluir máquinas: ${machinesError.message}`);
      }
      
      // Then delete the laundry itself
      const { error } = await supabase
        .from('laundries')
        .delete()
        .eq('id', laundryId);

      if (error) {
        console.error("Error deleting laundry:", error);
        throw new Error(`Erro ao excluir lavanderia: ${error.message}`);
      }
      
      return laundryId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundries'] });
      toast.success('Lavanderia excluída com sucesso');
    },
    onError: (error: Error) => {
      console.error("Error in delete mutation:", error);
      toast.error(error.message);
    }
  });
}
