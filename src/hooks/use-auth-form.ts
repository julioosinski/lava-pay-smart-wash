
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export const useAuthForm = (expectedRole: string = 'user') => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const redirectBasedOnRole = async (userId: string) => {
    try {
      console.log("Checking role for user:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching role:", error);
        throw error;
      }

      console.log("User role data:", data);
      console.log("Expected role:", expectedRole);
      
      const userRole = data?.role;

      // Direct match between expected role and actual role
      if (expectedRole === userRole) {
        console.log(`Role match: ${userRole}, redirecting to appropriate page`);
        if (userRole === 'admin') return '/admin';
        if (userRole === 'business') return '/owner';
      }

      // Role-based redirect regardless of expected role
      if (userRole === 'admin') {
        return '/admin';
      } else if (userRole === 'business') {
        return '/owner';
      }
      
      return '/';
    } catch (error) {
      console.error('Error checking user role:', error);
      toast({
        variant: "destructive",
        title: "Erro ao verificar permissões",
        description: "Não foi possível verificar seu perfil de usuário."
      });
      return '/';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        console.log("Attempting login with email:", email);
        await signIn(email, password);
        
        setTimeout(async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && !user) {
            console.log("Session exists but user state not updated yet, redirecting manually");
            const redirectPath = await redirectBasedOnRole(session.user.id);
            console.log("Redirecting to:", redirectPath);
            navigate(redirectPath);
          }
        }, 500);
      } else {
        await signUp(email, password);
        toast({
          title: "Registro realizado com sucesso!",
          description: "Verifique seu email para confirmar o cadastro.",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Auth error:", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro durante a autenticação",
      });
    }
  };

  return {
    isLogin,
    email,
    password,
    showPassword,
    loading,
    setIsLogin,
    setEmail,
    setPassword,
    setShowPassword,
    handleSubmit,
  };
};
