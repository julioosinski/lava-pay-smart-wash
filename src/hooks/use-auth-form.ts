
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
          console.log("Business login attempt with email and phone");
          
          try {
            await signIn(email.trim(), password.trim());
            console.log("Business login successful");
            sonnerToast.success("Login realizado com sucesso!");
            navigate('/owner');
          } catch (error) {
            console.error("Business login failed:", error);
            
            // Create a more helpful error message
            let errorMessage = "Verifique se o email e telefone estão corretos.";
            
            // Try to get more specific error information
            if (error instanceof Error) {
              if (error.message.includes("no matching laundry")) {
                errorMessage = "Não encontramos uma lavanderia com esse email e telefone. Verifique se estão corretos.";
              } else if (error.message.includes("Invalid login")) {
                errorMessage = "Credenciais inválidas. Verifique se o email e telefone estão corretos.";
              }
            }
            
            toast({
              variant: "destructive",
              title: "Erro de autenticação",
              description: errorMessage
            });
          }
        } else {
          // Normal login for other user types
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
        // Registration flow
        try {
          await signUp(email.trim(), password.trim());
          sonnerToast.success("Registro realizado com sucesso!");
          
          // Add role based on authentication screen context
          if (expectedRole) {
            // Fix: Cast the expectedRole to the appropriate union type
            const validRole = (expectedRole === 'admin' || expectedRole === 'business' || expectedRole === 'user') 
              ? expectedRole as 'admin' | 'business' | 'user'
              : 'user'; // Default to 'user' if not one of the expected values
            
            const { error: roleError } = await supabase
              .from('profiles')
              .update({ role: validRole })
              .eq('id', user?.id || '');
              
            if (roleError) {
              console.error("Error setting user role:", roleError);
            } else {
              console.log(`Role set to ${validRole} for new user`);
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
