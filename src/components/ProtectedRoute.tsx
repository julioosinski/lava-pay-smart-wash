
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
        setRole('admin');
        setLoading(false);
        return;
      }
      
      if (!user) {
        console.log(`ProtectedRoute: No user found, role required: ${requiredRole}`);
        setLoading(false);
        return;
      }

      try {
        console.log(`ProtectedRoute: Checking role for user ${user.id}, required role: ${requiredRole}`);
        
        // Check if email is admin@smartwash.com (hardcoded admin)
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('contact_email, role')
          .eq('id', user.id)
          .maybeSingle();
        
        if (userError) {
          console.error("ProtectedRoute: Error fetching user data:", userError);
          toast.error("Erro ao verificar permissões do usuário");
          setLoading(false);
          return;
        }
        
        // Admin access for admin@smartwash.com
        if (userData?.contact_email === 'admin@smartwash.com') {
          console.log("ProtectedRoute: Special admin user detected");
          setRole('admin');
          setLoading(false);
          return;
        }

        const userRole = userData?.role || null;
        console.log(`ProtectedRoute: User ${user.id} has role from database:`, userRole);
        setRole(userRole);
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
    // Make sure we're passing the role correctly to the state
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
