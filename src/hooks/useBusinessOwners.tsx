
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BusinessOwner } from "@/types";

export function useBusinessOwners() {
  return useQuery<BusinessOwner[]>({
    queryKey: ['business-owners'],
    queryFn: async () => {
      try {
        // Verificamos logs para identificar problemas na consulta
        console.log("Buscando proprietários de negócios...");
        
        // Query profiles com role = 'business'
        const { data: owners, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, contact_email, contact_phone, role')
          .eq('role', 'business');
          
        if (error) {
          console.error("Erro ao buscar proprietários:", error);
          throw error;
        }
        
        console.log("Proprietários encontrados:", owners);
        
        // Transformação de dados para o formato esperado pelos componentes
        const formattedOwners = (owners || []).map(owner => ({
          id: owner.id,
          name: `${owner.first_name || ''} ${owner.last_name || ''}`.trim() || 'Sem nome',
          email: owner.contact_email,
          phone: owner.contact_phone,
          role: owner.role
        }));
        
        console.log("Proprietários formatados:", formattedOwners);
        
        return formattedOwners;
      } catch (error) {
        console.error("Erro no hook useBusinessOwners:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true
  });
}
