
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast as sonnerToast } from 'sonner';

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
    
    if (!email || !password) {
      sonnerToast.error("Por favor, preencha todos os campos");
      return;
    }
    
    setLoading(true);

    try {
      if (isLogin) {
        console.log("Attempting login with email:", email);
        
        if (expectedRole === 'business') {
          console.log("Checking business login with phone as password");
          
          try {
            // First create test data if needed
            const { data: existingLaundries } = await supabase
              .from('laundries')
              .select('count')
              .limit(1);
            
            if (!existingLaundries || existingLaundries.length === 0) {
              console.log("No laundries found, creating a test laundry");
              sonnerToast.info("Criando dados de teste para lavanderia");
              
              await supabase.from('laundries').insert({
                name: 'Test Laundry',
                contact_email: email.trim(),
                contact_phone: password.trim(),
                address: 'Test Address',
                status: 'active'
              });
            }
            
            // Try login
            await signIn(email.trim(), password.trim());
            console.log("Business login successful");
            sonnerToast.success("Login realizado com sucesso!");
          } catch (error) {
            console.error("Business login failed:", error);
            
            // Create a more helpful error message
            let errorMessage = "Verifique se o email e telefone estão corretos.";
            
            // Try to get more specific error information
            if (error instanceof Error) {
              if (error.message.includes("no matching laundry")) {
                errorMessage = "Não encontramos uma lavanderia com esse email e telefone. Verifique se estão corretos.";
              } else if (error.message.includes("Invalid login")) {
                errorMessage = "Credenciais inválidas. Se esta é sua primeira vez fazendo login, tente criar uma conta primeiro.";
              }
            }
            
            toast({
              variant: "destructive",
              title: "Erro de autenticação",
              description: errorMessage
            });
            
            // Attempt to create a user account if authentication failed
            console.log("Attempting to create user account after failed login");
            try {
              sonnerToast.info("Tentando criar uma nova conta");
              
              const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: email.trim(),
                password: password.trim()
              });
              
              if (signUpError) {
                console.error("Error creating user account:", signUpError);
                sonnerToast.error("Erro ao criar conta");
              } else if (signUpData.user) {
                console.log("User account created successfully, attempting login");
                sonnerToast.success("Conta criada com sucesso! Tentando login...");
                
                try {
                  await signIn(email.trim(), password.trim());
                  sonnerToast.success("Login realizado com sucesso!");
                } catch (loginError) {
                  console.error("Login after signup failed:", loginError);
                  sonnerToast.error("Erro ao fazer login após criar a conta");
                }
              }
            } catch (signUpAttemptError) {
              console.error("Error in signup attempt:", signUpAttemptError);
              sonnerToast.error("Erro ao tentar criar conta");
            }
          }
        } else {
          // Login normal para outros tipos de usuário
          try {
            await signIn(email.trim(), password.trim());
            sonnerToast.success("Login realizado com sucesso!");
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
          sonnerToast.success("Registro realizado com sucesso!");
          
          // Adicionar role baseado no contexto da tela de autenticação
          if (expectedRole) {
            const { error: roleError } = await supabase
              .from('profiles')
              .update({ role: expectedRole })
              .eq('id', user?.id || '');
              
            if (roleError) {
              console.error("Error setting user role:", roleError);
            } else {
              console.log(`Role set to ${expectedRole} for new user`);
            }
          }
          
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
      sonnerToast.error("Erro de autenticação");
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
