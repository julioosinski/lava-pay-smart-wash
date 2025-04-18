
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
          
          const { data: laundries, error: laundryError } = await supabase
            .from('laundries')
            .select('*')  // Selecionando todos os campos para debug
            .eq('contact_email', email.trim())
            .eq('contact_phone', password.trim());
          
          console.log("Laundries found:", laundries);
          
          if (laundryError) {
            console.error("Error searching for laundries:", laundryError);
            toast({
              variant: "destructive",
              title: "Erro na consulta",
              description: laundryError.message || "Erro ao buscar lavanderia",
            });
            setLoading(false);
            return;
          }
          
          if (laundries && laundries.length > 0) {
            const laundryCheck = laundries[0];
            console.log("Found matching laundry:", laundryCheck);
            
            // Tente fazer login diretamente - se falhar, crie uma conta
            try {
              await signIn(email.trim(), password.trim());
              console.log("Login successful");
            } catch (loginError) {
              console.log("Login failed, trying to create account", loginError);
              // Se o login falhou, pode ser que o usuário ainda não exista
              // Tente criar a conta
              await signUp(email.trim(), password.trim());
              toast({
                title: "Conta criada com sucesso",
                description: "Uma conta foi criada para você. Faça login para continuar.",
              });
              
              // Tente fazer login novamente após criar a conta
              await signIn(email.trim(), password.trim());
            }
          } else {
            console.log("No matching laundry found with this email/phone combination");
            toast({
              variant: "destructive",
              title: "Credenciais inválidas",
              description: "Nenhuma lavanderia encontrada com este email e telefone.",
            });
            setLoading(false);
          }
        } else {
          // Login normal para outros tipos de usuário
          await signIn(email.trim(), password.trim());
        }
      } else {
        // Fluxo de cadastro
        await signUp(email.trim(), password.trim());
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
