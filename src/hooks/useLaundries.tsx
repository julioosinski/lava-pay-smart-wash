
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
  contact_phone?: string;
  contact_email?: string;
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
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (laundry: Pick<LaundryLocation, 'name' | 'address' | 'owner_id' | 'contact_phone' | 'contact_email'>) => {
      console.log("Creating laundry with data:", laundry);
      
      if (!session?.user) {
        throw new Error('User must be authenticated to create a laundry');
      }
      
      // Validate required fields before sending to the database
      if (!laundry.name || !laundry.address) {
        throw new Error('Missing required fields');
      }
      
      // Make sure owner_id is set to the current authenticated user
      const laundryData = {
        ...laundry,
        owner_id: session.user.id
      };
      
      console.log("Sending laundry data with authenticated user:", laundryData);
      
      const { data, error } = await supabase
        .from('laundries')
        .insert(laundryData)
        .select()
        .single();

      if (error) {
        console.error("Supabase error creating laundry:", error);
        throw error;
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
      toast.error('Erro ao criar lavanderia: ' + error.message);
    }
  });
}
