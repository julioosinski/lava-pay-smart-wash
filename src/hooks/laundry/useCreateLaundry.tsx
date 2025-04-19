
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LaundryLocation } from "@/types";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { createLaundryInDB } from "@/services/laundry";

// Define a type that matches what createLaundryInDB expects
type CreateLaundryInput = {
  name: string;
  address: string;
  contact_phone: string;
  contact_email: string;
  owner_id: string;
};

export function useCreateLaundry() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (laundry: CreateLaundryInput) => {
      if (!session?.user) {
        console.error("Authentication required: No authenticated user found");
        throw new Error('Você precisa estar autenticado para criar uma lavanderia');
      }
      
      console.log("Creating laundry with owner:", laundry.owner_id);
      
      if (!laundry.name || !laundry.address || !laundry.contact_email || !laundry.contact_phone) {
        throw new Error('Nome, endereço, email e telefone são obrigatórios');
      }

      return createLaundryInDB(laundry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundries'] });
      toast.success('Lavanderia criada com sucesso');
    },
    onError: (error: Error) => {
      console.error("Error in mutation:", error);
      toast.error(error.message);
    }
  });
}
