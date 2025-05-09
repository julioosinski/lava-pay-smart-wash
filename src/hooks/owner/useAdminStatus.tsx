
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
        
        // Verificar diretamente se o usuário já existe na sessão atual
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.user_metadata?.role === 'admin') {
          console.log("Admin encontrado nos metadados do usuário:", user);
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }
        
        // Tentar obter o papel do usuário diretamente, sem RLS
        try {
          // Usando uma direta RPC com security definer
          const { data: roleData, error: roleError } = await supabase
            .rpc('get_role_directly', { user_id: userId });
          
          if (!roleError && roleData) {
            setIsAdmin(roleData === 'admin');
            setIsLoading(false);
            console.log("Papel do usuário (direto):", roleData);
            return;
          } else {
            console.error("Erro ao buscar papel via RPC direta:", roleError);
          }
        } catch (directErr) {
          console.error("Exceção ao verificar papel do usuário:", directErr);
        }
        
        // Último fallback: verificar a tabela de profiles sem usar RLS
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
