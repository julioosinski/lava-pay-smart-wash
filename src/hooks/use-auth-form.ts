
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
        
        // Verificar se o usuário é um proprietário tentando fazer login com telefone como senha
        if (expectedRole === 'business') {
          console.log("Checking business login with phone as password");
          
          // Primeiro, verificar se existe uma lavanderia com esse email e telefone
          const { data: laundryData, error: laundryError } = await supabase
            .from('laundries')
            .select('contact_email, contact_phone, owner_id')
            .eq('contact_email', email)
            .eq('contact_phone', password)
            .single();
          
          if (laundryData) {
            console.log("Found laundry with matching email and phone:", laundryData);
            // Se encontramos a lavanderia, tentamos fazer login com credenciais padrão
            // Assumindo que durante o cadastro da lavanderia, criou-se um usuário com:
            // - email = email de contato da lavanderia
            // - senha = telefone de contato da lavanderia
            await signIn(email, password);
          } else {
            console.log("No matching laundry found, trying regular login");
            // Se não encontrar, tenta o login normal
            await signIn(email, password);
          }
        } else {
          // Login normal para outros tipos de usuário
          await signIn(email, password);
        }
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
