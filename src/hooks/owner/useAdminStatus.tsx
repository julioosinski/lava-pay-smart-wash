
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
        
        // Usar a função segura com SECURITY DEFINER para evitar recursão
        const { data: isAdminData, error: rpcError } = await supabase
          .rpc('is_user_admin_safely', { user_id: userId });
          
        if (!rpcError) {
          setIsAdmin(!!isAdminData);
          setIsLoading(false);
          console.log("User admin status (from secure RPC):", !!isAdminData);
          return;
        } else {
          console.log("Secure RPC error:", rpcError);
        }
        
        // Fallback para função alternativa se a primeira falhar
        try {
          const { data: roleData, error: roleError } = await supabase
            .rpc('get_user_role_safely', { user_id: userId });
            
          if (!roleError && roleData) {
            setIsAdmin(roleData === 'admin');
            setIsLoading(false);
            console.log("User admin status (from direct role query):", roleData === 'admin');
            return;
          } else {
            console.log("Direct role query error:", roleError);
          }
        } catch (directErr) {
          console.error("Direct role query error, falling back:", directErr);
        }
        
        // Último fallback: verificar os metadados do usuário
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user && user.user_metadata?.role === 'admin') {
            setIsAdmin(true);
            console.log("User admin status (from metadata):", true);
          } else {
            setIsAdmin(false);
            console.log("User admin status (from metadata):", false);
          }
        } catch (error) {
          console.error("Error checking admin status from metadata:", error);
          setIsAdmin(false);
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
