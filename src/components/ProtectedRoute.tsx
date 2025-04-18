
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
    // Você pode criar um componente de loading melhor aqui
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  // Se não há usuário autenticado, redireciona para a página de login
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Se um papel específico é exigido, verifica se o usuário tem esse papel
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" />;
  }

  // Se passar pelas verificações, renderiza a rota protegida
  return <>{children}</>;
}
