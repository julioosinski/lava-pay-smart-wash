
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { createLaundryInDB, CreateLaundryParams } from "@/services/laundry";

export function useCreateLaundry() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (laundry: CreateLaundryParams) => {
      if (!session?.user) {
        console.error("Authentication required: No authenticated user found");
        throw new Error('Você precisa estar autenticado para criar uma lavanderia');
      }
      
      console.log("Creating laundry with owner:", laundry.owner_id);
      
      if (!laundry.name || !laundry.address || !laundry.contact_email || !laundry.contact_phone) {
        throw new Error('Nome, endereço, email e telefone são obrigatórios');
      }

      try {
        // Usar o serviço atualizado que chama a edge function
        const response = await createLaundryInDB({
          ...laundry,
          // Ensure the owner_id is properly set for admins creating laundries for others
          owner_id: laundry.owner_id || session.user.id
        });
        return response;
      } catch (error: any) {
        console.error("Error creating laundry:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundries'] });
      toast.success('Lavanderia criada com sucesso');
    },
    onError: (error: Error) => {
      console.error("Error in mutation:", error);
      toast.error(error.message || 'Erro ao criar lavanderia');
    }
  });
}
