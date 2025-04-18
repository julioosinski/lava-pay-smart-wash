import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LaundryLocation } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { UseQueryOptions } from '@tanstack/react-query';

// DB type to match what's coming from the database
type LaundryDB = {
  id: string;
  name: string;
  address: string;
  owner_id: string;
  status?: string;
  contact_phone: string;
  contact_email: string;
  created_at?: string;
  updated_at?: string;
  latitude?: number | null;
  longitude?: number | null;
};

// Convert database laundry to app laundry
const convertToLaundry = (dbLaundry: LaundryDB): LaundryLocation => ({
  id: dbLaundry.id,
  name: dbLaundry.name,
  address: dbLaundry.address,
  owner_id: dbLaundry.owner_id,
  contact_phone: dbLaundry.contact_phone,
  contact_email: dbLaundry.contact_email,
  status: dbLaundry.status,
  created_at: dbLaundry.created_at,
  updated_at: dbLaundry.updated_at
});

export function useLaundries(options?: { 
  ownerId?: string, 
  forceShowAll?: boolean,
  options?: Omit<UseQueryOptions<LaundryLocation[], Error>, 'queryKey' | 'queryFn'>
}) {
  return useQuery({
    queryKey: ['laundries', options?.ownerId, options?.forceShowAll],
    queryFn: async () => {
      try {
        let query = supabase
          .from('laundries')
          .select('*');
          
        // Only filter by owner_id if provided and not forcing to show all
        if (options?.ownerId && !options?.forceShowAll) {
          console.log(`Filtering laundries by owner_id: ${options.ownerId}`);
          query = query.eq('owner_id', options.ownerId);
        } else {
          console.log("Fetching all laundries (no owner filter)");
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching laundries:", error);
          throw error;
        }
        
        console.log(`Fetched ${data?.length || 0} laundries:`, data);
        return (data || []).map(laundry => convertToLaundry(laundry as LaundryDB));
      } catch (error) {
        console.error("Error in useLaundries hook:", error);
        throw error;
      }
    },
    ...options?.options
  });
}

export function useCreateLaundry() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (laundry: Pick<LaundryLocation, 'name' | 'address' | 'contact_phone' | 'contact_email'>) => {
      if (!user) {
        console.error("Authentication required: No authenticated user found");
        throw new Error('Você precisa estar autenticado para criar uma lavanderia');
      }
      
      console.log("Creating laundry with user:", user.id);
      
      // Validate required fields before sending to the database
      if (!laundry.name || !laundry.address || !laundry.contact_email || !laundry.contact_phone) {
        throw new Error('Nome, endereço, email e telefone são obrigatórios');
      }
      
      // Create the laundry using RPC call instead of direct insert
      // This will properly handle the owner_id and related user creation
      const { data, error } = await supabase
        .from('laundries')
        .insert({
          ...laundry,
          owner_id: user.id
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

export function useUpdateLaundry() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (laundry: Pick<LaundryLocation, 'id' | 'name' | 'address' | 'contact_phone' | 'contact_email'>) => {
      if (!session) {
        throw new Error('Você precisa estar autenticado para atualizar uma lavanderia');
      }
      
      const { data, error } = await supabase
        .from('laundries')
        .update({
          name: laundry.name,
          address: laundry.address,
          contact_phone: laundry.contact_phone,
          contact_email: laundry.contact_email,
        })
        .eq('id', laundry.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating laundry:", error);
        throw error;
      }
      
      return convertToLaundry(data as LaundryDB);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['laundries'] });
      toast.success('Lavanderia atualizada com sucesso');
    },
    onError: (error: Error) => {
      console.error("Error in mutation:", error);
      toast.error(error.message);
    }
  });
}

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
