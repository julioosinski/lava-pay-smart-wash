
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
        console.log(`ProtectedRoute: User ${user.id} has role: ${userRole}`);
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
    return <Navigate to="/auth" />;
  }

  // If a specific role is required, check if user has that role
  if (requiredRole && role !== requiredRole) {
    console.log(`ProtectedRoute: Access denied - User role ${role} doesn't match required role ${requiredRole}`);
    if (role === 'business') {
      return <Navigate to="/owner" replace />;
    } else if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // If user passes all checks, render the protected content
  console.log(`ProtectedRoute: User ${user.id} authorized for route requiring role: ${requiredRole}`);
  return <>{children}</>;
}
