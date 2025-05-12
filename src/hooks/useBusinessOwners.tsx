
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
        
        // Try to use the edge function to get business owners
        const { data, error } = await supabase.functions.invoke('list-business-owners');
          
        if (error) {
          console.error("Erro ao buscar proprietários:", error);
          
          // Fallback: If the edge function fails, try to fetch directly
          // This will work if the user has appropriate permissions
          console.log("Tentando buscar proprietários diretamente...");
          const { data: directData, error: directError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, contact_email, contact_phone, role')
            .eq('role', 'business');
            
          if (directError) {
            console.error("Erro na busca direta:", directError);
            throw directError;
          }
          
          if (Array.isArray(directData)) {
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
          
          throw error;
        }
        
        if (Array.isArray(data)) {
          console.log("Proprietários encontrados (Edge Function):", data.length);
          
          if (data.length === 0) {
            console.log("Nenhum proprietário encontrado. Verifique se existem usuários com role='business'");
          }
          
          return data as BusinessOwner[];
        }
        
        console.error("Formato de resposta inesperado:", data);
        return [];
      } catch (error) {
        console.error("Erro no hook useBusinessOwners:", error);
        toast.error("Erro ao buscar proprietários: " + ((error as Error)?.message || "Erro desconhecido"));
        return []; // Return empty array instead of throwing to avoid breaking the UI
      }
    },
    staleTime: 1000 * 60, // 1 minuto de staleness
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });
}
