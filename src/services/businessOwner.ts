
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
          role: 'business'
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
          role: 'business'
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
