
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LaundryLocation } from "@/types";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { convertToLaundry, LaundryDB } from "@/types/laundry";

export function useCreateLaundry() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (laundry: Pick<LaundryLocation, 'name' | 'address' | 'contact_phone' | 'contact_email'>) => {
      if (!session?.user) {
        console.error("Authentication required: No authenticated user found");
        throw new Error('Você precisa estar autenticado para criar uma lavanderia');
      }
      
      console.log("Creating laundry with user:", session.user.id);
      
      if (!laundry.name || !laundry.address || !laundry.contact_email || !laundry.contact_phone) {
        throw new Error('Nome, endereço, email e telefone são obrigatórios');
      }
      
      // Use direct insert without relying on any database trigger to create users
      const { data, error } = await supabase
        .from('laundries')
        .insert({
          name: laundry.name,
          address: laundry.address,
          contact_phone: laundry.contact_phone,
          contact_email: laundry.contact_email,
          owner_id: session.user.id,
          // Add status explicitly to avoid any null constraints
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error creating laundry:", error);
        throw new Error(`Erro ao criar lavanderia: ${error.message}`);
      }
      
      console.log("Laundry created successfully:", data);
      return convertToLaundry(data as LaundryDB);
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
