
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
        const { data, error } = await supabase
          .from('laundries')
          .update({
            name: laundry.name,
            address: laundry.address,
            contact_phone: laundry.contact_phone,
            contact_email: laundry.contact_email,
            owner_id: laundry.owner_id
          })
          .eq('id', laundry.id)
          .select()
          .single();

        if (error) {
          console.error("Error updating laundry:", error);
          throw new Error(`Erro ao atualizar lavanderia: ${error.message}`);
        }
        
        return convertToLaundry(data as LaundryDB);
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
