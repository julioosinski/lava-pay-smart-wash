
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
    staleTime: 1000, // 1 segundo de staleness para permitir múltiplas atualizações próximas
    refetchOnMount: true, // Recarregar quando o componente montar
    refetchOnWindowFocus: true // Recarregar quando a janela receber foco
  });
}
