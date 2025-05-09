
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminStatus } from '@/hooks/owner/useAdminStatus';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'business' | 'user';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin, isLoading: isLoadingAdminStatus } = useAdminStatus(user?.id);

  useEffect(() => {
    const checkRole = async () => {
      if (authLoading || isLoadingAdminStatus) {
        // Aguardar verificações de autenticação e status de admin
        console.log("ProtectedRoute: Aguardando conclusão das verificações de auth e admin");
        return;
      }
      
      // Verificar se tem bypass administrativo
      const adminBypass = localStorage.getItem('admin_bypass') === 'true';
      const bypassTimestamp = parseInt(localStorage.getItem('admin_bypass_timestamp') || '0');
      const bypassValid = Date.now() - bypassTimestamp < 4 * 60 * 60 * 1000; // 4 horas de validade
      
      if (adminBypass && bypassValid && requiredRole === 'admin') {
        console.log("ProtectedRoute: Acesso admin direto via bypass detectado");
        setRole('admin');
        setLoading(false);
        return;
      } else if (adminBypass && !bypassValid) {
        // Limpar bypass expirado
        console.log("ProtectedRoute: Bypass admin expirado, removendo");
        localStorage.removeItem('admin_bypass');
        localStorage.removeItem('admin_bypass_timestamp');
      }
      
      if (!user) {
        console.log(`ProtectedRoute: Nenhum usuário encontrado, papel requerido: ${requiredRole}`);
        setLoading(false);
        return;
      }

      try {
        console.log(`ProtectedRoute: Verificando papel para usuário ${user.id}, papel requerido: ${requiredRole}`);
        
        // Se o usuário já foi confirmado como admin pelo useAdminStatus, definir papel
        if (isAdmin) {
          console.log("ProtectedRoute: Usuário confirmado como admin pelo useAdminStatus");
          setRole('admin');
          setLoading(false);
          return;
        }
        
        // Verificar diretamente no objeto user.user_metadata primeiro
        if (user.user_metadata?.role) {
          const metadataRole = user.user_metadata.role;
          console.log("Papel encontrado em user_metadata:", metadataRole);
          setRole(metadataRole);
          setLoading(false);
          return;
        }
        
        // Verificar diretamente na tabela profiles
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
            
          if (!error && data) {
            setRole(data.role);
            console.log("Papel obtido diretamente da tabela profiles:", data.role);
          } else {
            console.error("Erro ao verificar papel diretamente:", error);
            setRole('user'); // Papel padrão
          }
        } catch (err) {
          console.error("Erro ao verificar papel diretamente:", err);
          setRole('user'); // Papel padrão 
        }
        
        setLoading(false);
      } catch (error) {
        console.error("ProtectedRoute: Erro ao verificar papel:", error);
        toast.error("Erro ao verificar permissões do usuário");
        setLoading(false);
      }
    };

    checkRole();
    
    // Timeout de segurança para evitar loading infinito
    const timeout = setTimeout(() => {
      if (loading) {
        console.log("ProtectedRoute: Timeout de segurança acionado");
        setLoading(false);
      }
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [user, requiredRole, authLoading, isAdmin, isLoadingAdminStatus]);

  // Se o contexto de autenticação ainda está carregando, mostrar spinner
  if (authLoading || isLoadingAdminStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-lavapay-600 mx-auto mb-3" />
          <span className="block text-lg">Verificando autenticação...</span>
        </div>
      </div>
    );
  }

  // Se verificando papel, mostrar mensagem de carregamento diferente
  if (loading && user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-lavapay-600 mx-auto mb-3" />
          <span className="block text-lg">Verificando permissões...</span>
        </div>
      </div>
    );
  }

  // Verificar bypass admin
  const adminBypass = localStorage.getItem('admin_bypass') === 'true';
  const bypassTimestamp = parseInt(localStorage.getItem('admin_bypass_timestamp') || '0');
  const bypassValid = Date.now() - bypassTimestamp < 4 * 60 * 60 * 1000; // 4 horas de validade
  
  // Se for rota admin e tiver bypass válido, permitir acesso
  if (requiredRole === 'admin' && adminBypass && bypassValid) {
    console.log("ProtectedRoute: Acesso admin liberado via bypass");
    return <>{children}</>;
  }

  // Se não houver usuário autenticado e não for admin bypass, redirecionar para página de login com papel requerido
  if (!user && !(adminBypass && bypassValid && requiredRole === 'admin')) {
    console.log("ProtectedRoute: Nenhum usuário autenticado, redirecionando para página de auth");
    return <Navigate to="/auth" state={{ role: requiredRole || 'user' }} replace />;
  }

  // Se um papel específico é requerido, verificar se o usuário tem esse papel ou é admin
  if (requiredRole) {
    // Verificar se o usuário é admin ou tem o papel requerido
    if (requiredRole === 'admin' && !isAdmin && !(adminBypass && bypassValid)) {
      console.log("ProtectedRoute: Acesso negado - Usuário não é admin");
      toast.error("Acesso negado. Você não tem permissões de administrador.");
      return <Navigate to="/" replace />;
    } else if (requiredRole === 'business' && role !== 'business' && !isAdmin) {
      console.log(`ProtectedRoute: Acesso negado - Papel do usuário ${role} não corresponde ao papel requerido business`);
      toast.error(`Acesso negado. Seu papel atual (${role || 'usuário'}) não tem permissão para esta página.`);
      return <Navigate to="/" replace />;
    } else if (requiredRole === 'user' && role !== 'user' && role !== 'business' && !isAdmin) {
      console.log(`ProtectedRoute: Acesso negado - Papel do usuário ${role} não corresponde ao papel requerido user`);
      toast.error(`Acesso negado. Seu papel atual (${role || 'desconhecido'}) não tem permissão para esta página.`);
      return <Navigate to="/" replace />;
    }
  }

  // Se o usuário passa por todas as verificações, renderizar conteúdo protegido
  console.log(`ProtectedRoute: Usuário ${user ? user.id : 'bypass'} autorizado para rota requerendo papel: ${requiredRole}`);
  return <>{children}</>;
}
