
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LaundryLocation } from "@/types";
import { convertToLaundry, LaundryDB } from "@/types/laundry";

export interface UseFetchLaundriesOptions {
  ownerId?: string;
  forceShowAll?: boolean;
  options?: any;
}

export function useFetchLaundries(options?: UseFetchLaundriesOptions) {
  return useQuery<LaundryLocation[], Error>({
    queryKey: ['laundries', options?.ownerId, options?.forceShowAll],
    queryFn: async () => {
      try {
        console.log("Fetching laundries with options:", options);
        let query = supabase
          .from('laundries')
          .select('*');
          
        // Filtrar por owner_id se fornecido e não estiver forçando mostrar tudo
        if (options?.ownerId && !options?.forceShowAll) {
          console.log(`Filtering laundries by owner_id: ${options.ownerId}`);
          query = query.eq('owner_id', options.ownerId);
        } else if (options?.forceShowAll) {
          console.log("Fetching all laundries (admin mode)");
        } else {
          console.log("Fetching laundries without owner filter");
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching laundries:", error);
          throw error;
        }
        
        const laundries: LaundryLocation[] = (data || []).map(laundry => convertToLaundry(laundry as LaundryDB));
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
