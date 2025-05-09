
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAdminStatus(userId?: string) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const checkAdminRole = async () => {
      // Verificar primeiro se há bypass administrativo
      const adminBypass = localStorage.getItem('admin_bypass') === 'true';
      const bypassTimestamp = parseInt(localStorage.getItem('admin_bypass_timestamp') || '0');
      const bypassValid = Date.now() - bypassTimestamp < 4 * 60 * 60 * 1000; // 4 horas de validade
      
      if (adminBypass && bypassValid) {
        console.log("Admin bypass detectado e válido");
        setIsAdmin(true);
        setIsLoading(false);
        return;
      } else if (adminBypass && !bypassValid) {
        // Limpar bypass expirado
        localStorage.removeItem('admin_bypass');
        localStorage.removeItem('admin_bypass_timestamp');
      }
      
      if (!userId) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Verificar diretamente se o usuário já existe na sessão atual
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.user_metadata?.role === 'admin') {
          console.log("Admin encontrado nos metadados do usuário:", user);
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }
        
        // Simplificar a abordagem e verificar diretamente na tabela profiles
        try {
          // Esta chamada não usa RPC, mas sim executa SQL para buscar o papel
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .maybeSingle();
          
          if (!error && data) {
            console.log("Obtido papel diretamente da tabela profiles:", data.role);
            setIsAdmin(data.role === 'admin');
          } else {
            console.error("Erro ao verificar papel diretamente da tabela:", error);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Erro final ao verificar status admin:", error);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Erro ao verificar status de administrador:", error);
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
