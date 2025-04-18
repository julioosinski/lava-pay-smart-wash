
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

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
      
      if (!user) {
        console.log(`ProtectedRoute: No user found, role required: ${requiredRole}`);
        setLoading(false);
        return;
      }

      try {
        console.log(`ProtectedRoute: Checking role for user ${user.id}, required role: ${requiredRole}`);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error("ProtectedRoute: Error fetching role:", error);
          setLoading(false);
          return;
        }

        const userRole = data?.role || null;
        console.log(`ProtectedRoute: User ${user.id} has role from database:`, userRole);
        setRole(userRole);
        setLoading(false);
      } catch (error) {
        console.error("ProtectedRoute: Error checking role:", error);
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

  // If there's no authenticated user, redirect to login page
  if (!user) {
    console.log("ProtectedRoute: No authenticated user, redirecting to auth page");
    // If a specific role was required, pass it as state to the auth page
    return <Navigate to="/auth" state={{ role: requiredRole }} replace />;
  }

  // If a specific role is required, check if user has that role
  if (requiredRole && role !== requiredRole) {
    console.log(`ProtectedRoute: Access denied - User role ${role} doesn't match required role ${requiredRole}`);
    
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
  console.log(`ProtectedRoute: User ${user.id} authorized for route requiring role: ${requiredRole}`);
  return <>{children}</>;
}
