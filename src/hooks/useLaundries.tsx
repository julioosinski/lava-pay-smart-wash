
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LaundryLocation } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

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

export function useLaundries(options?: { ownerId?: string, forceShowAll?: boolean }) {
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
    }
  });
}

export function useCreateLaundry() {
  const queryClient = useQueryClient();
  const { user, session } = useAuth();

  return useMutation({
    mutationFn: async (laundry: Pick<LaundryLocation, 'name' | 'address' | 'contact_phone' | 'contact_email'>) => {
      if (!user || !session) {
        console.error("Authentication required: No authenticated user found");
        throw new Error('Você precisa estar autenticado para criar uma lavanderia');
      }
      
      console.log("Creating laundry with user:", user.id);
      
      // Validate required fields before sending to the database
      if (!laundry.name || !laundry.address || !laundry.contact_email || !laundry.contact_phone) {
        throw new Error('Nome, endereço, email e telefone são obrigatórios');
      }
      
      // Make sure owner_id is set to the current authenticated user
      const laundryData = {
        ...laundry,
        owner_id: user.id,
        // Ensure these fields are always provided
        contact_email: laundry.contact_email,
        contact_phone: laundry.contact_phone
      };
      
      console.log("Sending laundry data with authenticated user:", laundryData);
      
      const { data, error } = await supabase
        .from('laundries')
        .insert(laundryData)
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
