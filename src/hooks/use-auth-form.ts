
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
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
        
        if (expectedRole === 'business') {
          console.log("Checking business login with phone as password");
          
          // Buscar lavanderia com o email e telefone fornecidos
          // Primeiro vamos logar os parâmetros para debug
          console.log("Searching for laundry with email:", email, "and phone:", password);
          
          try {
            // Tentar login direto (agora com atualização de perfil integrada)
            await signIn(email.trim(), password.trim());
            console.log("Business login successful");
          } catch (error) {
            console.error("Business login failed:", error);
            toast({
              variant: "destructive",
              title: "Credenciais inválidas",
              description: "Verifique se o email e telefone estão corretos. Certifique-se de usar o email e telefone exatos cadastrados para a sua lavanderia."
            });
          }
        } else {
          // Login normal para outros tipos de usuário
          try {
            await signIn(email.trim(), password.trim());
          } catch (error) {
            console.error("Login error:", error);
            toast({
              variant: "destructive",
              title: "Erro ao fazer login",
              description: error instanceof Error ? error.message : "Ocorreu um erro durante o login"
            });
          }
        }
      } else {
        // Fluxo de cadastro
        try {
          await signUp(email.trim(), password.trim());
          toast({
            title: "Registro realizado com sucesso!",
            description: "Verifique seu email para confirmar o cadastro.",
          });
        } catch (error) {
          console.error("Registration error:", error);
          toast({
            variant: "destructive",
            title: "Erro ao criar conta",
            description: error instanceof Error ? error.message : "Ocorreu um erro durante o cadastro"
          });
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
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
