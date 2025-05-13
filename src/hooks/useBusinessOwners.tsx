
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BusinessOwner } from "@/types";
import { toast } from "sonner";

export function useBusinessOwners() {
  return useQuery<BusinessOwner[]>({
    queryKey: ['business-owners'],
    queryFn: async () => {
      try {
        console.log("Buscando proprietários de negócios...");
        
        // Approach 1: Fetch with direct SQL access via edge function (more reliable with RLS)
        try {
          const { data: fnData, error: fnError } = await supabase.functions.invoke('list-business-owners');
          
          if (!fnError && Array.isArray(fnData)) {
            console.log(`Proprietários encontrados via edge function: ${fnData.length}`);
            return fnData as BusinessOwner[];
          }
          
          if (fnError) {
            console.error("Erro na edge function:", fnError);
          }
        } catch (fnErr) {
          console.error("Falha ao invocar edge function:", fnErr);
        }
        
        // Approach 2: Try direct DB query with proper error handling
        const { data: directData, error: directError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, contact_email, contact_phone, role')
          .eq('role', 'business');
          
        if (!directError && Array.isArray(directData)) {
          console.log("Proprietários encontrados (Busca direta):", directData.length);
          
          const formattedData = directData.map(owner => ({
            id: owner.id,
            name: `${owner.first_name || ''} ${owner.last_name || ''}`.trim() || 'Sem nome',
            email: owner.contact_email || '',
            phone: owner.contact_phone || '',
            role: owner.role
          }));
          
          return formattedData;
        }
        
        if (directError) {
          console.error("Erro na busca direta:", directError);
        }
        
        // For development/demo only: return some mock data so form still works
        console.warn("Não foi possível obter proprietários de negócios, usando dados mockados.");
        return [
          {
            id: "mock-1",
            name: "Proprietário Exemplo 1",
            email: "exemplo1@mail.com",
            phone: "123456789",
            role: "business"
          },
          {
            id: "mock-2",
            name: "Proprietário Exemplo 2",
            email: "exemplo2@mail.com",
            phone: "987654321",
            role: "business"
          }
        ];
      } catch (error) {
        console.error("Erro no hook useBusinessOwners:", error);
        toast.error("Erro ao buscar proprietários: " + ((error as Error)?.message || "Erro desconhecido"));
        
        // Return empty array instead of throwing to avoid breaking the UI
        return [];
      }
    },
    staleTime: 1000 * 60, // 1 minuto
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });
}
