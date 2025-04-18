
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

  console.log("Auth form initialized with expected role:", expectedRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        console.log("Attempting login with email:", email);
        const result = await signIn(email, password);
        
        // Additional debugging
        console.log("Login successful, checking for specific roles");
        
        // Let the AuthContext handle the redirection based on role
        // We won't add additional redirection logic here to avoid conflicts
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
