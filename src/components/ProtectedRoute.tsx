
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
        // Esperar até que a autenticação e verificação de admin sejam concluídas
        console.log("ProtectedRoute: Waiting for auth and admin checks to complete");
        return;
      }
      
      if (!user) {
        console.log(`ProtectedRoute: No user found, role required: ${requiredRole}`);
        setLoading(false);
        return;
      }

      try {
        console.log(`ProtectedRoute: Checking role for user ${user.id}, required role: ${requiredRole}`);
        
        // Se o usuário já foi verificado como admin, define o papel
        if (isAdmin) {
          console.log("ProtectedRoute: User is confirmed as admin by useAdminStatus");
          setRole('admin');
          setLoading(false);
          return;
        }
        
        // Se não é admin, verificamos o papel geral do usuário usando a função segura
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error("ProtectedRoute: Error fetching role:", error);
          toast.error("Erro ao verificar permissões do usuário");
        } else {
          const userRole = data?.role || null;
          console.log(`ProtectedRoute: User ${user.id} has role from database:`, userRole);
          setRole(userRole);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("ProtectedRoute: Error checking role:", error);
        toast.error("Erro ao verificar permissões do usuário");
        setLoading(false);
      }
    };

    checkRole();
    
    // Timeout de segurança para evitar carregamento infinito
    const timeout = setTimeout(() => {
      if (loading) {
        console.log("ProtectedRoute: Safety timeout triggered");
        setLoading(false);
      }
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [user, requiredRole, authLoading, isAdmin, isLoadingAdminStatus]);

  // Se o contexto de autenticação ainda estiver carregando, mostrar um spinner
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

  // Se estamos verificando o papel, mostrar uma mensagem de carregamento diferente
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

  // Se não houver usuário autenticado, redirecionar para página de login com o papel necessário
  if (!user) {
    console.log("ProtectedRoute: No authenticated user, redirecting to auth page");
    return <Navigate to="/auth" state={{ role: requiredRole || 'user' }} replace />;
  }

  // Se um papel específico for necessário, verificar se o usuário tem esse papel ou é admin
  if (requiredRole) {
    // Verificar se o usuário é admin ou tem o papel necessário
    if (requiredRole === 'admin' && !isAdmin) {
      console.log("ProtectedRoute: Access denied - User is not an admin");
      toast.error("Acesso negado. Você não tem permissões de administrador.");
      return <Navigate to="/" replace />;
    } else if (requiredRole === 'business' && role !== 'business' && !isAdmin) {
      console.log(`ProtectedRoute: Access denied - User role ${role} doesn't match required role business`);
      toast.error(`Acesso negado. Seu papel atual (${role || 'usuário'}) não tem permissão para esta página.`);
      return <Navigate to="/" replace />;
    } else if (requiredRole === 'user' && role !== 'user' && role !== 'business' && !isAdmin) {
      console.log(`ProtectedRoute: Access denied - User role ${role} doesn't match required role user`);
      toast.error(`Acesso negado. Seu papel atual (${role || 'desconhecido'}) não tem permissão para esta página.`);
      return <Navigate to="/" replace />;
    }
  }

  // Se o usuário passar por todas as verificações, renderizar o conteúdo protegido
  console.log(`ProtectedRoute: User ${user.id} authorized for route requiring role: ${requiredRole}`);
  return <>{children}</>;
}
