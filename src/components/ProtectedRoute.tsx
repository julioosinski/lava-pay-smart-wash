
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
        // Wait for auth and admin status checks
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
        
        // If user is already confirmed as admin, set role
        if (isAdmin) {
          console.log("ProtectedRoute: User is confirmed as admin by useAdminStatus");
          setRole('admin');
          setLoading(false);
          return;
        }
        
        // Try multiple methods to determine user role
        let userRole = null;
        
        // Method 1: Try secure RPC function
        try {
          const { data: roleData, error: roleError } = await supabase
            .rpc('get_user_role_safely', { user_id: user.id });
            
          if (!roleError && roleData) {
            userRole = roleData;
            console.log("Role via secure RPC:", userRole);
          } else {
            console.log("Secure RPC error:", roleError);
          }
        } catch (err) {
          console.error("Secure RPC role check failed:", err);
        }
        
        // Method 2: Try direct role query function
        if (!userRole) {
          try {
            const { data: directRoleData, error: directRoleError } = await supabase
              .rpc('get_role_directly', { user_id: user.id });
              
            if (!directRoleError && directRoleData) {
              userRole = directRoleData;
              console.log("Role via direct query RPC:", userRole);
            } else {
              console.log("Direct role RPC error:", directRoleError);
            }
          } catch (err) {
            console.error("Direct role RPC failed:", err);
          }
        }
        
        // Method 3: Check user metadata
        if (!userRole && user.user_metadata?.role) {
          userRole = user.user_metadata.role;
          console.log("Role from user metadata:", userRole);
        }
        
        // Set detected role
        if (userRole) {
          console.log(`ProtectedRoute: User ${user.id} has role:`, userRole);
          setRole(userRole);
        } else {
          console.log("No role detected, using default 'user' role");
          setRole('user'); // Default role
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
  }, [user, requiredRole, authLoading, isAdmin, isLoadingAdminStatus]);

  // If auth context is still loading, show a spinner
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

  // If checking role, show a different loading message
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

  // If no authenticated user, redirect to login page with required role
  if (!user) {
    console.log("ProtectedRoute: No authenticated user, redirecting to auth page");
    return <Navigate to="/auth" state={{ role: requiredRole || 'user' }} replace />;
  }

  // If a specific role is required, check if user has that role or is admin
  if (requiredRole) {
    // Check if user is admin or has required role
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

  // If user passes all checks, render protected content
  console.log(`ProtectedRoute: User ${user.id} authorized for route requiring role: ${requiredRole}`);
  return <>{children}</>;
}
