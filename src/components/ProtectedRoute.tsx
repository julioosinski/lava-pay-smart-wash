
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

  useEffect(() => {
    // Flag to track component mount status
    let isMounted = true;
    
    const checkRole = async () => {
      if (authLoading) {
        // Wait for auth to complete before checking roles
        console.log("ProtectedRoute: Waiting for auth to complete");
        return;
      }
      
      // Check for direct admin access
      const directAdminAccess = localStorage.getItem('direct_admin') === 'true';
      
      if (directAdminAccess && requiredRole === 'admin') {
        console.log("ProtectedRoute: Direct admin access granted");
        if (isMounted) {
          setRole('admin');
          setLoading(false);
        }
        return;
      }
      
      if (!user) {
        console.log(`ProtectedRoute: No user found, role required: ${requiredRole}`);
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        console.log(`ProtectedRoute: Checking role for user ${user.id}, required role: ${requiredRole}`);
        
        // Use the RPC function to safely get user role
        const { data: userRole, error: roleError } = await supabase.rpc(
          'get_user_role_safely_no_rls',
          { user_id: user.id }
        );
        
        if (roleError) {
          console.error("ProtectedRoute: Error fetching user role:", roleError);
          toast.error("Erro ao verificar permissões do usuário");
          if (isMounted) {
            setLoading(false);
          }
          return;
        }
        
        // Special admin email check
        if (user.email === 'admin@smartwash.com') {
          console.log("ProtectedRoute: Special admin user detected");
          if (isMounted) {
            setRole('admin');
            setLoading(false);
          }
          return;
        }

        console.log(`ProtectedRoute: User ${user.id} has role from database:`, userRole);
        if (isMounted) {
          setRole(userRole);
          setLoading(false);
        }
      } catch (error) {
        console.error("ProtectedRoute: Error checking role:", error);
        toast.error("Erro ao verificar permissões do usuário");
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkRole();
    
    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading && isMounted) {
        console.log("ProtectedRoute: Safety timeout triggered");
        setLoading(false);
      }
    }, 3000);
    
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [user, requiredRole, authLoading, loading]);

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
  if (loading && (user || localStorage.getItem('direct_admin') === 'true')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-lavapay-600 mx-auto mb-3" />
          <span className="block text-lg">Verificando permissões...</span>
        </div>
      </div>
    );
  }

  // Handle direct admin access
  const directAdminAccess = localStorage.getItem('direct_admin') === 'true';
  if (directAdminAccess && requiredRole === 'admin') {
    console.log("ProtectedRoute: Direct admin access granted for admin route");
    return <>{children}</>;
  }

  // If there's no authenticated user, redirect to login page with the required role
  if (!user && !directAdminAccess) {
    console.log("ProtectedRoute: No authenticated user, redirecting to auth page");
    return <Navigate to="/auth" state={{ role: requiredRole || 'user' }} replace />;
  }

  // If a specific role is required, check if user has that role
  if (requiredRole && role !== requiredRole) {
    console.log(`ProtectedRoute: Access denied - User role ${role} doesn't match required role ${requiredRole}`);
    toast.error(`Acesso negado. Seu papel atual (${role || 'usuário'}) não tem permissão para esta página.`);
    
    // Redirect based on the user's actual role
    if (role === 'business') {
      console.log("ProtectedRoute: Redirecting business user to /owner");
      return <Navigate to="/owner" replace />;
    } else if (role === 'admin') {
      console.log("ProtectedRoute: Redirecting admin user to /admin");
      return <Navigate to="/admin" replace />;
    } else {
      console.log("ProtectedRoute: Redirecting standard user to /");
      return <Navigate to="/" replace />;
    }
  }

  // If user passes all checks, render the protected content
  console.log(`ProtectedRoute: User ${user?.id || 'with direct access'} authorized for route requiring role: ${requiredRole}`);
  return <>{children}</>;
}
