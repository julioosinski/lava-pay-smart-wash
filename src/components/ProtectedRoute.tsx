
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'business' | 'user';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      if (authLoading) {
        // Wait for auth to complete before checking roles
        console.log("ProtectedRoute: Waiting for auth to complete");
        return;
      }
      
      if (!user) {
        console.log(`ProtectedRoute: No user found, role required: ${requiredRole}`);
        setLoading(false);
        return;
      }

      try {
        console.log(`ProtectedRoute: Checking role for user ${user.id}, required role: ${requiredRole}`);
        
        // Verificar se o usuário é admin usando a função RPC
        if (requiredRole === 'admin') {
          const { data: adminStatus, error: adminError } = await supabase
            .rpc('is_admin', { user_id: user.id });
            
          if (adminError) {
            console.error("ProtectedRoute: Error checking admin role:", adminError);
            toast.error("Erro ao verificar permissões de administrador");
          } else {
            setIsAdmin(!!adminStatus);
            if (!!adminStatus) {
              setRole('admin');
              console.log("ProtectedRoute: User is confirmed as admin");
              setLoading(false);
              return;
            }
          }
        }
        
        // Verificar o papel geral do usuário
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
    
    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log("ProtectedRoute: Safety timeout triggered");
        setLoading(false);
      }
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [user, requiredRole, authLoading]);

  // If the auth context is still loading, show a loading spinner
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-lavapay-600 mx-auto mb-3" />
          <span className="block text-lg">Verificando autenticação...</span>
        </div>
      </div>
    );
  }

  // If we're checking the role, show a different loading message
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

  // If there's no authenticated user, redirect to login page with the required role
  if (!user) {
    console.log("ProtectedRoute: No authenticated user, redirecting to auth page");
    return <Navigate to="/auth" state={{ role: requiredRole || 'user' }} replace />;
  }

  // If a specific role is required, check if user has that role or is admin
  if (requiredRole) {
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

  // If user passes all checks, render the protected content
  console.log(`ProtectedRoute: User ${user.id} authorized for route requiring role: ${requiredRole}`);
  return <>{children}</>;
}
