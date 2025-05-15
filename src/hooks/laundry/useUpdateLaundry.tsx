
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LaundryLocation } from "@/types";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { convertToLaundry, LaundryDB } from "@/types/laundry";
import { useAdminStatus } from "@/hooks/owner/useAdminStatus";

export function useUpdateLaundry() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { isAdmin } = useAdminStatus();

  return useMutation({
    mutationFn: async (laundry: Pick<LaundryLocation, 'id' | 'name' | 'address' | 'contact_phone' | 'contact_email' | 'owner_id'>) => {
      // Verifica se o usuário está autenticado ou é administrador com acesso direto
      const isAuthenticated = session?.user || (isAdmin || localStorage.getItem('direct_admin') === 'true');
      
      if (!isAuthenticated) {
        throw new Error('Você precisa estar autenticado para atualizar uma lavanderia');
      }
      
      try {
        // Primeiro, atualizar os dados
        const { error: updateError } = await supabase
          .from('laundries')
          .update({
            name: laundry.name,
            address: laundry.address,
            contact_phone: laundry.contact_phone,
            contact_email: laundry.contact_email,
            owner_id: laundry.owner_id
          })
          .eq('id', laundry.id);

        if (updateError) {
          console.error("Error updating laundry:", updateError);
          throw new Error(`Erro ao atualizar lavanderia: ${updateError.message}`);
        }
        
        // Depois, buscar os dados atualizados separadamente
        const { data: fetchedData, error: fetchError } = await supabase
          .from('laundries')
          .select()
          .eq('id', laundry.id)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching updated laundry:", fetchError);
          throw new Error(`Erro ao buscar lavanderia atualizada: ${fetchError.message}`);
        }
        
        if (!fetchedData) {
          throw new Error("Lavanderia não encontrada após atualização");
        }
        
        return convertToLaundry(fetchedData as LaundryDB);
      } catch (error: any) {
        console.error("Exception in laundry update:", error);
        throw new Error(`Erro ao atualizar lavanderia: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundries'] });
      toast.success('Lavanderia atualizada com sucesso');
    },
    onError: (error: Error) => {
      console.error("Error in mutation:", error);
      toast.error(error.message);
    }
  });
}
