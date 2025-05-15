import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

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
      
      // Update the profile directly using the update method instead of RPC
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
    // IMPORTANTE: Use phone number as password for business owners
    const cleanPhone = phone.replace(/\D/g, '');
    const password = cleanPhone || "business123"; // Fallback in case phone is empty
    
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
    
    // Update the profile directly instead of using RPC
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        contact_phone: phone,
        contact_email: email,
        role: 'business',
        first_name: name.split(' ')[0],
        last_name: name.split(' ').slice(1).join(' ') || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (updateError) {
      console.error("Erro ao atualizar perfil:", updateError);
      // Continue since user was created successfully
    }
    
    // Also update the laundries that might have this contact email to associate with the new owner
    const { error: laundryUpdateError } = await supabase
      .from('laundries')
      .update({ owner_id: userId })
      .eq('contact_email', email);
    
    if (laundryUpdateError) {
      console.error("Erro ao associar lavanderias ao novo proprietário:", laundryUpdateError);
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
    
    // Update profile data directly using the update method
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        contact_phone: phone,
        contact_email: email,
        role: 'business',
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error("Erro ao atualizar perfil:", updateError);
      return { error: updateError.message, userId: null };
    }
    
    // Update all laundries owned by this user with new contact info
    const { error: laundryUpdateError } = await supabase
      .from('laundries')
      .update({
        contact_email: email,
        contact_phone: phone
      })
      .eq('owner_id', userId);
    
    if (laundryUpdateError) {
      console.error("Erro ao atualizar informações de contato das lavanderias:", laundryUpdateError);
      // Not critical, continue
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
    
    // Update the profile directly to remove business role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'user',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error("Erro ao remover proprietário:", updateError);
      return { success: false, error: updateError.message };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Erro ao excluir proprietário:", error);
    return { success: false, error: "Erro desconhecido" };
  }
}
