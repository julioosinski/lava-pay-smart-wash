
import { supabase } from "@/integrations/supabase/client";

interface CreateBusinessOwnerParams {
  name: string;
  email: string;
  phone: string;
}

interface CreateBusinessOwnerResult {
  userId?: string;
  error?: string;
}

export async function createBusinessOwner(params: CreateBusinessOwnerParams): Promise<CreateBusinessOwnerResult> {
  try {
    console.log("Criando proprietário com parâmetros:", params);
    
    // Primeiro, crie o usuário Auth
    const { data: userData, error: authError } = await supabase.auth.signUp({
      email: params.email,
      password: params.phone, // Usando o telefone como senha inicial
      options: {
        data: {
          role: 'business',
        }
      }
    });

    if (authError) {
      console.error("Erro ao criar auth do proprietário:", authError);
      throw authError;
    }

    const userId = userData.user?.id;
    if (!userId) {
      throw new Error("ID do usuário não foi gerado");
    }

    // Em seguida, atualize o perfil do usuário
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: params.name.split(' ')[0] || '',
        last_name: params.name.split(' ').slice(1).join(' ') || '',
        contact_email: params.email,
        contact_phone: params.phone,
        role: 'business'
      })
      .eq('id', userId);

    if (profileError) {
      console.error("Erro ao atualizar perfil do proprietário:", profileError);
      throw profileError;
    }

    console.log("Proprietário criado com sucesso. ID:", userId);
    return { userId };
  } catch (error) {
    console.error("Erro ao criar proprietário:", error);
    return { 
      error: error instanceof Error ? error.message : "Erro desconhecido" 
    };
  }
}
