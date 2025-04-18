
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
          const { data: laundryCheck, error: laundryError } = await supabase
            .from('laundries')
            .select('contact_email, contact_phone, owner_id')
            .eq('contact_email', email)
            .eq('contact_phone', password)
            .single();
          
          console.log("Laundry check result:", laundryCheck, laundryError);
          
          if (laundryCheck) {
            console.log("Found matching laundry. Attempting login or account creation");
            // Tente fazer login diretamente - se falhar, crie uma conta
            try {
              await signIn(email, password);
              console.log("Login successful");
            } catch (loginError) {
              console.log("Login failed, trying to create account", loginError);
              // Se o login falhou, pode ser que o usuário ainda não exista
              // Tente criar a conta
              await signUp(email, password);
              toast({
                title: "Conta criada com sucesso",
                description: "Uma conta foi criada para você. Faça login para continuar.",
              });
              
              // Tente fazer login novamente após criar a conta
              await signIn(email, password);
            }
          } else {
            console.log("No matching laundry found with this email/phone combination");
            toast({
              variant: "destructive",
              title: "Credenciais inválidas",
              description: "Nenhuma lavanderia encontrada com este email e telefone.",
            });
          }
        } else {
          // Login normal para outros tipos de usuário
          await signIn(email, password);
        }
      } else {
        // Fluxo de cadastro
        await signUp(email, password);
        toast({
          title: "Registro realizado com sucesso!",
          description: "Verifique seu email para confirmar o cadastro.",
        });
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro durante a autenticação",
      });
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
