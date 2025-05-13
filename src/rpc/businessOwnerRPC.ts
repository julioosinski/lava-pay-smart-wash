
import { supabase } from "@/integrations/supabase/client";

// We'll use this to create the RPC functions needed for business owners
export async function createListBusinessOwnersRPC() {
  try {
    console.log('Verificando função edge list-business-owners...');
    
    // First try to invoke the edge function
    try {
      const { error } = await supabase.functions.invoke('create-business-owners-rpc');
      
      if (error) {
        console.error('Erro ao criar funções RPC via edge function:', error);
        console.log('Usando alternativas para buscar proprietários...');
      } else {
        console.log('Funções RPC criadas com sucesso via edge function');
      }
    } catch (e) {
      console.error('Falha ao executar edge function para criação de RPCs:', e);
    }
    
    // We'll still try to use the list-business-owners function directly
    console.log('Usando Edge Function list-business-owners para buscar proprietários de negócios');
    
    // Invoking once to check if it works and log results
    try {
      const { data, error } = await supabase.functions.invoke('list-business-owners');
      
      if (error) {
        console.error('Erro ao testar a função list-business-owners:', error);
        console.log('Busca direta será usada como fallback');
      } else {
        console.log('Edge Function list-business-owners está funcionando corretamente');
        console.log('Retornou', (data as any[])?.length || 0, 'proprietários');
      }
    } catch (error) {
      console.error('Erro ao verificar função edge list-business-owners:', error);
    }
  } catch (error) {
    console.error('Erro ao verificar função edge list-business-owners:', error);
  }
}

// Create mock data generator for development and testing
export function getMockBusinessOwners() {
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
}
