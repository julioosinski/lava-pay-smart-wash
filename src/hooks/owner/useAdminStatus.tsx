
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { simplifiedToast } from "@/components/ui/use-toast";

export function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Use RPC to safely check if user is admin
        const { data, error } = await supabase.rpc(
          'is_admin_safely_no_rls',
          { user_id: user.id }
        );
          
        if (error) {
          console.error("Error checking user role:", error);
          simplifiedToast.error("Erro ao verificar permissões de administrador");
          setIsLoading(false);
          return;
        }
        
        setIsAdmin(data === true);
        console.log("User is admin:", data === true);
      } catch (error) {
        console.error("Error checking admin status:", error);
        simplifiedToast.error("Erro ao verificar permissões de administrador");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminRole();
  }, [user?.id]);

  return { isAdmin, isLoading };
}
