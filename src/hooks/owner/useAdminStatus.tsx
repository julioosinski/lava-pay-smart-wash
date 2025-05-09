
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAdminStatus(userId?: string) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!userId) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        // Chamando a função RPC is_admin para verificar se o usuário é admin
        const { data, error } = await supabase
          .rpc('is_admin', { user_id: userId });
          
        if (error) {
          console.error("Error checking admin status:", error);
          toast.error("Erro ao verificar permissões de administrador");
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
          console.log("User is admin:", !!data);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast.error("Erro ao verificar status de administrador");
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminRole();
  }, [userId]);

  return { isAdmin, isLoading };
}
