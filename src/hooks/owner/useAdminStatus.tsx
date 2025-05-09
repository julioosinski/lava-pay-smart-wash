
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
        
        // Primeiro tenta usar a RPC is_admin
        try {
          const { data: isAdminData, error: rpcError } = await supabase
            .rpc('is_admin', { user_id: userId });
            
          if (!rpcError) {
            setIsAdmin(!!isAdminData);
            setIsLoading(false);
            console.log("User admin status (from RPC):", !!isAdminData);
            return;
          }
        } catch (rpcErr) {
          console.error("RPC error, falling back to direct query:", rpcErr);
        }
        
        // Fallback: consulta direta à tabela de perfis
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();
            
          if (error) {
            console.error("Error checking role directly:", error);
            setIsAdmin(false);
          } else {
            setIsAdmin(data?.role === 'admin');
            console.log("User admin status (from direct query):", data?.role === 'admin');
          }
        } catch (error) {
          console.error("Error in direct role check:", error);
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
