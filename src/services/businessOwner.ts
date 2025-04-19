import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export interface CreateBusinessOwnerParams {
  name: string;  // Ensuring name is required, not optional
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
    
    // First, check if the user already exists by email
    const { data: existingUsers, error: searchError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('contact_email', params.email);
    
    if (searchError) {
      console.error("Erro ao verificar usuário existente:", searchError);
      throw searchError;
    }
    
    let userId;
    
    // If user exists, update their role and profile
    if (existingUsers && existingUsers.length > 0) {
      console.log("Usuário já existe, atualizando perfil:", existingUsers[0]);
      userId = existingUsers[0].id;
      
      // Update the profile with business role and contact info
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: params.name.split(' ')[0] || '',
          last_name: params.name.split(' ').slice(1).join(' ') || '',
          contact_phone: params.phone,
          role: 'business' as Database["public"]["Enums"]["user_role"]
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error("Erro ao atualizar perfil do usuário existente:", updateError);
        throw updateError;
      }
      
      console.log("Perfil de usuário existente atualizado com sucesso. ID:", userId);
    } else {
      // Create new user if doesn't exist
      console.log("Criando novo usuário auth");
      
      // Create the user Auth
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

      userId = userData.user?.id;
      if (!userId) {
        throw new Error("ID do usuário não foi gerado");
      }

      // Update the user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: params.name.split(' ')[0] || '',
          last_name: params.name.split(' ').slice(1).join(' ') || '',
          contact_email: params.email,
          contact_phone: params.phone,
          role: 'business' as Database["public"]["Enums"]["user_role"]
        })
        .eq('id', userId);

      if (profileError) {
        console.error("Erro ao atualizar perfil do proprietário:", profileError);
        throw profileError;
      }
      
      console.log("Proprietário criado com sucesso. ID:", userId);
    }

    return { userId };
  } catch (error) {
    console.error("Erro ao criar proprietário:", error);
    return { 
      error: error instanceof Error ? error.message : "Erro desconhecido" 
    };
  }
}

// Função para atualizar um proprietário existente
export async function updateBusinessOwner(id: string, params: CreateBusinessOwnerParams): Promise<CreateBusinessOwnerResult> {
  try {
    console.log("Atualizando proprietário:", id, params);
    
    // Verificar se o ID é válido
    if (!id || id.trim() === '') {
      throw new Error("ID do proprietário inválido");
    }
    
    // Extrair primeiro nome e sobrenome do nome completo
    const firstName = params.name.split(' ')[0] || '';
    const lastName = params.name.split(' ').slice(1).join(' ') || '';
    
    console.log("Nome separado:", { firstName, lastName });
    
    // Update the profile
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        contact_email: params.email,
        contact_phone: params.phone,
        role: 'business' as Database["public"]["Enums"]["user_role"] // Garantir que o papel é 'business'
      })
      .eq('id', id)
      .select();
    
    if (updateError) {
      console.error("Erro ao atualizar perfil do proprietário:", updateError);
      throw updateError;
    }
    
    console.log("Proprietário atualizado com sucesso:", data);
    return { userId: id };
  } catch (error) {
    console.error("Erro ao atualizar proprietário:", error);
    return { 
      error: error instanceof Error ? error.message : "Erro desconhecido" 
    };
  }
}

// Função para deletar um proprietário
export async function deleteBusinessOwner(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("Deletando proprietário:", id);
    
    // Verificamos se o proprietário tem lavanderias associadas
    const { data: laundries, error: laundryError } = await supabase
      .from('laundries')
      .select('id')
      .eq('owner_id', id);
    
    if (laundryError) {
      console.error("Erro ao verificar lavanderias do proprietário:", laundryError);
      throw laundryError;
    }
    
    if (laundries && laundries.length > 0) {
      return { 
        success: false, 
        error: `Este proprietário possui ${laundries.length} lavanderias associadas e não pode ser excluído.` 
      };
    }
    
    // Desativamos o perfil mudando o papel para 'user'
    console.log("Desativando perfil do usuário:", id);
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'user' as Database["public"]["Enums"]["user_role"],
        contact_email: null,
        contact_phone: null,
        first_name: null,
        last_name: null
      })
      .eq('id', id);
      
    if (updateError) {
      console.error("Erro ao desativar perfil:", updateError);
      throw updateError;
    }
    
    console.log("Proprietário excluído com sucesso. ID:", id);
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar proprietário:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido" 
    };
  }
}
