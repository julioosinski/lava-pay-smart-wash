
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LaundryLocation } from "@/types";
import { convertToLaundry, LaundryDB } from "@/types/laundry";

export interface UseFetchLaundriesOptions {
  ownerId?: string;
  forceShowAll?: boolean;
  options?: any; // This is a simplification to avoid TypeScript errors
}

export function useFetchLaundries(options?: UseFetchLaundriesOptions) {
  return useQuery<LaundryLocation[], Error>({
    queryKey: ['laundries', options?.ownerId, options?.forceShowAll],
    queryFn: async () => {
      try {
        console.log("Fetching laundries with options:", options);
        
        // Use edge function to bypass RLS policies
        const { data, error } = await supabase.functions.invoke('manage-laundries', {
          body: {
            action: 'list',
            ownerId: options?.ownerId,
            forceShowAll: options?.forceShowAll
          }
        });
        
        if (error) {
          console.error("Error fetching laundries:", error);
          throw new Error(`Erro ao buscar lavanderias: ${error.message}`);
        }
        
        if (!data || data.error) {
          console.error("Service error fetching laundries:", data?.error || "Unknown error");
          throw new Error(`Erro ao buscar lavanderias: ${data?.error || "Erro desconhecido"}`);
        }
        
        const laundries: LaundryLocation[] = (data.laundries || []).map(laundry => convertToLaundry(laundry as LaundryDB));
        console.log(`Successfully fetched ${laundries.length} laundries:`, laundries);
        return laundries;
      } catch (error) {
        console.error("Error in useFetchLaundries hook:", error);
        throw error as Error;
      }
    },
    ...(options?.options || {})
  });
}
