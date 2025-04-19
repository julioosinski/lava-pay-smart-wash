
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateBusinessOwnerProps {
  email: string;
  phone: string;
}

export async function createBusinessOwner({ email, phone }: CreateBusinessOwnerProps) {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('contact_email', email)
      .maybeSingle();

    if (existingUser) {
      return { userId: existingUser.id };
    }

    // Create new user if doesn't exist
    const { data: newUser, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: phone.replace(/\D/g, ''),
      options: {
        data: {
          role: 'business'
        }
      }
    });

    if (signUpError) {
      console.error("Error creating user:", signUpError);
      throw new Error("Erro ao criar usuário");
    }

    const userId = newUser.user?.id;

    if (userId) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'business',
          contact_email: email,
          contact_phone: phone
        })
        .eq('id', userId);

      if (updateError) {
        console.error("Error updating user profile:", updateError);
        throw new Error("Erro ao atualizar perfil do usuário");
      }
    }

    return { userId: newUser.user?.id };
  } catch (error) {
    console.error("Error in createBusinessOwner:", error);
    throw error;
  }
}
