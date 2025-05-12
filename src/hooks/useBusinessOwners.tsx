
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BusinessOwner } from "@/types";

export function useBusinessOwners() {
  return useQuery<BusinessOwner[]>({
    queryKey: ['business-owners'],
    queryFn: async () => {
      try {
        console.log("Buscando proprietários de negócios...");
        
        // Query profiles with role = 'business'
        const { data: owners, error } = await supabase.rpc('list_business_owners');
          
        if (error) {
          console.error("Erro ao buscar proprietários:", error);
          
          // Fallback to direct query if RPC fails
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, contact_email, contact_phone, role')
            .eq('role', 'business');
            
          if (fallbackError) {
            console.error("Erro ao fazer fallback para busca de proprietários:", fallbackError);
            throw fallbackError;
          }
          
          console.log("Proprietários encontrados (fallback):", fallbackData?.length || 0);
          
          const formattedOwners = (fallbackData || []).map(owner => ({
            id: owner.id,
            name: `${owner.first_name || ''} ${owner.last_name || ''}`.trim() || 'Sem nome',
            email: owner.contact_email || '',
            phone: owner.contact_phone || '',
            role: owner.role
          }));
          
          return formattedOwners;
        }
        
        console.log("Proprietários encontrados (RPC):", owners?.length || 0);
        
        // For RPC response, the data format might already be in the expected format
        return owners || [];
      } catch (error) {
        console.error("Erro no hook useBusinessOwners:", error);
        throw error;
      }
    },
    staleTime: 1000, // 1 segundo de staleness para permitir múltiplas atualizações próximas
    refetchOnMount: true, // Recarregar quando o componente montar
    refetchOnWindowFocus: true // Recarregar quando a janela receber foco
  });
}
