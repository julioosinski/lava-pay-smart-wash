
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LaundryLocation } from "@/types";
import { convertToLaundry, LaundryDB } from "@/types/laundry";

export function useFetchLaundries(options?: { 
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
        console.error("Error in useFetchLaundries hook:", error);
        throw error;
      }
    },
    ...options?.options
  });
}
