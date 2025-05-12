
import { supabase } from "@/integrations/supabase/client";

export async function createListBusinessOwnersRPC() {
  try {
    console.log('Verificando função edge list-business-owners...');
    
    // Apenas enviamos um log para confirmação, já que vamos usar a Edge Function diretamente
    console.log('Usando Edge Function list-business-owners para buscar proprietários de negócios');
    
    // Invocar a função uma vez para garantir que está funcionando e registrar logs
    const { data, error } = await supabase.functions.invoke('list-business-owners');
    
    if (error) {
      console.error('Erro ao testar a função list-business-owners:', error);
    } else {
      console.log('Edge Function list-business-owners está funcionando corretamente');
      console.log('Retornou', (data as any[])?.length || 0, 'proprietários');
    }
  } catch (error) {
    console.error('Erro ao verificar função edge list-business-owners:', error);
  }
}
