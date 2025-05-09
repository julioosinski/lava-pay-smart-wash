
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAdminStatus(userId?: string) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        // Usando uma função RPC para chamar a função is_admin no banco de dados
        // Isso evita problemas com a política de segurança recursiva
        const { data, error } = await supabase
          .rpc('is_admin', { user_id: userId });
          
        if (error) {
          console.error("Error checking user role:", error);
          toast.error("Erro ao verificar permissões do usuário");
          return;
        }
        
        setIsAdmin(!!data);
        console.log("User is admin:", !!data);
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast.error("Erro ao verificar status de administrador");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminRole();
  }, [userId]);

  return { isAdmin, isLoading };
}
