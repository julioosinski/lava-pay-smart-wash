
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
        setLoading(false);
        return;
      }

      try {
        console.log("Checking role for protected route, user:", user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching role:", error);
          setLoading(false);
          return;
        }

        console.log("User role data for protected route:", data);
        setRole(data?.role || null);
      } catch (error) {
        console.error("Error checking role:", error);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [user]);

  if (loading) {
    // Show a better loading state with rotating spinner
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-lavapay-600" />
        <span className="ml-2 text-lg">Carregando...</span>
      </div>
    );
  }

  // If there's no authenticated user, redirect to login page
  if (!user) {
    console.log("No authenticated user, redirecting to auth page");
    return <Navigate to="/auth" />;
  }

  // If a specific role is required, check if user has that role
  if (requiredRole && role !== requiredRole) {
    console.log(`User role ${role} doesn't match required role ${requiredRole}, redirecting to home`);
    return <Navigate to="/" />;
  }

  // If user passes all checks, render the protected content
  console.log("User authorized for protected route");
  return <>{children}</>;
}
