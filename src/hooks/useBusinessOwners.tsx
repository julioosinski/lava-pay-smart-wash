
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BusinessOwner } from "@/types";

export function useBusinessOwners() {
  return useQuery<BusinessOwner[]>({
    queryKey: ['business-owners'],
    queryFn: async () => {
      try {
        console.log("Buscando proprietários de negócios...");
        
        // Query profiles com role = 'business'
        const { data: owners, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, contact_email, contact_phone, role')
          .eq('role', 'business')
          .order('first_name');  // Ordenar por nome
          
        if (error) {
          console.error("Erro ao buscar proprietários:", error);
          throw error;
        }
        
        console.log("Proprietários encontrados:", owners?.length || 0);
        console.log("Dados brutos:", owners);
        
        // Transformação de dados para o formato esperado pelos componentes
        const formattedOwners = (owners || []).map(owner => ({
          id: owner.id,
          name: `${owner.first_name || ''} ${owner.last_name || ''}`.trim() || 'Sem nome',
          email: owner.contact_email,
          phone: owner.contact_phone,
          role: owner.role
        }));
        
        console.log("Proprietários formatados:", formattedOwners.length);
        console.log("Dados formatados:", formattedOwners);
        
        return formattedOwners;
      } catch (error) {
        console.error("Erro no hook useBusinessOwners:", error);
        throw error;
      }
    },
    staleTime: 0, // Sem cache
    gcTime: 0,  // Sem retenção de dados em cache
    refetchOnMount: 'always', // Sempre refetch ao montar o componente
    refetchOnWindowFocus: true,
    refetchInterval: false,
  });
}
