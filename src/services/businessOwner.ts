
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BusinessOwnerInput {
  name: string;
  email: string;
  phone: string;
}

export async function createBusinessOwner({
  name,
  email,
  phone,
}: BusinessOwnerInput) {
  try {
    console.log("Criando proprietário com parâmetros:", { name, email, phone });
    
    // Check if a user with this email already exists in profiles
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('contact_email', email)
      .maybeSingle();
    
    if (checkError) {
      console.error("Erro ao verificar usuário existente:", checkError);
      // Continue with creation even if check fails
    }
    
    if (existingUser?.id) {
      console.log("Usuário já existe, atualizando para business:", existingUser);
      
      // Split the name into first and last name
      const nameParts = name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      // Update existing user to have business role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          contact_phone: phone,
          role: 'business',
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id);
      
      if (updateError) {
        console.error("Erro ao atualizar perfil existente:", updateError);
        return { error: "Falha ao atualizar usuário existente", userId: null };
      }
      
      return { userId: existingUser.id, error: null };
    }
    
    // If no existing user, create a new auth user and profile
    // For demo purposes, create a password based on the phone (not secure for production)
    const password = phone.replace(/[^0-9]/g, '') || "business123";
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: name.split(' ')[0],
          last_name: name.split(' ').slice(1).join(' ')
        }
      }
    });
    
    if (authError) {
      console.error("Erro ao criar usuário:", authError);
      return { error: authError.message, userId: null };
    }
    
    const userId = authData.user?.id;
    
    if (!userId) {
      console.error("Usuário criado, mas ID não disponível");
      return { error: "ID de usuário não disponível", userId: null };
    }
    
    // Ensure profile has business role and contact info
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        contact_phone: phone,
        contact_email: email,
        role: 'business'
      })
      .eq('id', userId);
      
    if (updateError) {
      console.error("Erro ao atualizar perfil:", updateError);
      // Continue since user was created successfully
    }
    
    return { userId, error: null };
  } catch (error) {
    console.error("Erro ao criar proprietário:", error);
    return { error: "Erro desconhecido", userId: null };
  }
}

export async function updateBusinessOwner(
  userId: string,
  { name, email, phone }: BusinessOwnerInput
) {
  try {
    console.log("Atualizando proprietário:", userId, { name, email, phone });
    
    // Split the name into first and last name
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    // Update profile data
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        contact_email: email,
        contact_phone: phone,
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString(),
        role: 'business'
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error("Erro ao atualizar perfil:", updateError);
      return { error: updateError.message, userId: null };
    }
    
    return { userId, error: null };
  } catch (error) {
    console.error("Erro ao atualizar proprietário:", error);
    return { error: "Erro desconhecido", userId: null };
  }
}
