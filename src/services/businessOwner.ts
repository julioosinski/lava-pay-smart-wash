
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
      
      // Call RPC function to avoid RLS recursion
      const { data: updateData, error: updateError } = await supabase.rpc(
        'update_profile_safely',
        {
          profile_id: existingUser.id,
          contact_phone_val: phone,
          role_val: 'business',
          first_name_val: firstName,
          last_name_val: lastName
        }
      );
      
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
    
    // Ensure profile has business role and contact info using RPC
    const { error: rpcError } = await supabase.rpc(
      'update_profile_safely',
      {
        profile_id: userId,
        contact_phone_val: phone,
        contact_email_val: email,
        role_val: 'business',
        first_name_val: name.split(' ')[0],
        last_name_val: name.split(' ').slice(1).join(' ') || ''
      }
    );
      
    if (rpcError) {
      console.error("Erro ao atualizar perfil:", rpcError);
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
    
    // Update profile data using RPC
    const { error: rpcError } = await supabase.rpc(
      'update_profile_safely',
      {
        profile_id: userId,
        contact_phone_val: phone,
        contact_email_val: email,
        role_val: 'business',
        first_name_val: firstName,
        last_name_val: lastName
      }
    );
    
    if (rpcError) {
      console.error("Erro ao atualizar perfil:", rpcError);
      return { error: rpcError.message, userId: null };
    }
    
    return { userId, error: null };
  } catch (error) {
    console.error("Erro ao atualizar proprietário:", error);
    return { error: "Erro desconhecido", userId: null };
  }
}

export async function deleteBusinessOwner(userId: string) {
  try {
    console.log("Excluindo proprietário:", userId);
    
    // First check if this user owns any laundries
    const { data: laundries, error: checkError } = await supabase
      .from('laundries')
      .select('id, name')
      .eq('owner_id', userId);
      
    if (checkError) {
      console.error("Erro ao verificar lavanderias do proprietário:", checkError);
      return { success: false, error: "Erro ao verificar lavanderias do proprietário" };
    }
    
    // If user has laundries, don't allow deletion
    if (laundries && laundries.length > 0) {
      return { 
        success: false, 
        error: `Este proprietário possui ${laundries.length} lavanderia(s). Remova as lavanderias primeiro.` 
      };
    }
    
    // Update the profile to remove business role using RPC
    const { error: rpcError } = await supabase.rpc(
      'update_profile_safely',
      {
        profile_id: userId,
        role_val: 'user'
      }
    );
    
    if (rpcError) {
      console.error("Erro ao remover proprietário:", rpcError);
      return { success: false, error: rpcError.message };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Erro ao excluir proprietário:", error);
    return { success: false, error: "Erro desconhecido" };
  }
}
