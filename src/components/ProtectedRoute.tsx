
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
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        console.log(`ProtectedRoute: No user found, role required: ${requiredRole}`);
        setLoading(false);
        return;
      }

      try {
        console.log(`ProtectedRoute: Checking role for user ${user.id}, required role: ${requiredRole}`);
        
        // Log the user object to debug
        console.log("ProtectedRoute: User object:", JSON.stringify(user));
        
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("ProtectedRoute: Error fetching role:", error);
          setLoading(false);
          return;
        }

        const userRole = data?.role || null;
        console.log(`ProtectedRoute: User ${user.id} has role from database:`, userRole);
        setRole(userRole);
      } catch (error) {
        console.error("ProtectedRoute: Error checking role:", error);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [user, requiredRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-lavapay-600" />
        <span className="ml-2 text-lg">Carregando...</span>
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
