
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BusinessOwner {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role: string;
}

export function useBusinessOwners() {
  return useQuery<BusinessOwner[]>({
    queryKey: ['business-owners'],
    queryFn: async () => {
      try {
        // Query profiles with role = 'business'
        const { data: owners, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, contact_email, contact_phone, role')
          .eq('role', 'business');
          
        if (error) {
          console.error("Error fetching business owners:", error);
          throw error;
        }
        
        return (owners || []).map(owner => ({
          id: owner.id,
          name: `${owner.first_name || ''} ${owner.last_name || ''}`.trim() || 'Sem nome',
          email: owner.contact_email,
          phone: owner.contact_phone,
          role: owner.role
        }));
      } catch (error) {
        console.error("Error in useBusinessOwners hook:", error);
        throw error;
      }
    }
  });
}
