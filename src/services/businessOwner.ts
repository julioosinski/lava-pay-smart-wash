
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
    console.log("Criando proprietário:", { name, email, phone });
    
    // Use edge function instead of direct database operations
    const { data, error } = await supabase.functions.invoke('manage-business-owners', {
      body: {
        action: 'create',
        data: { name, email, phone }
      }
    });
    
    if (error) {
      console.error("Erro ao invocar edge function:", error);
      return { error: error.message, userId: null };
    }
    
    if (!data.success) {
      console.error("Erro retornado pela edge function:", data.error);
      return { error: data.error, userId: null };
    }
    
    return { userId: data.userId, error: null };
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
    
    // Use edge function instead of direct database operations
    const { data, error } = await supabase.functions.invoke('manage-business-owners', {
      body: {
        action: 'update',
        data: { id: userId, name, email, phone }
      }
    });
    
    if (error) {
      console.error("Erro ao invocar edge function:", error);
      return { error: error.message, userId: null };
    }
    
    if (!data.success) {
      console.error("Erro retornado pela edge function:", data.error);
      return { error: data.error, userId: null };
    }
    
    return { userId: data.userId, error: null };
  } catch (error) {
    console.error("Erro ao atualizar proprietário:", error);
    return { error: "Erro desconhecido", userId: null };
  }
}

export async function deleteBusinessOwner(userId: string) {
  try {
    console.log("Excluindo proprietário:", userId);
    
    // Use edge function instead of direct database operations
    const { data, error } = await supabase.functions.invoke('manage-business-owners', {
      body: {
        action: 'delete',
        data: { id: userId }
      }
    });
    
    if (error) {
      console.error("Erro ao invocar edge function:", error);
      return { success: false, error: error.message };
    }
    
    if (!data.success) {
      console.error("Erro retornado pela edge function:", data.error);
      return { success: false, error: data.error };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Erro ao excluir proprietário:", error);
    return { success: false, error: "Erro desconhecido" };
  }
}
