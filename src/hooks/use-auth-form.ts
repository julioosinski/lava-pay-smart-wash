
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
        
        // Special case for admin login
        if (email === 'admin@smartwash.com' && password === 'admin123') {
          try {
            console.log("Admin login detected, setting direct admin access");
            localStorage.setItem('direct_admin', 'true');
            navigate('/admin', { replace: true });
            return;
          } catch (error) {
            console.error("Error in admin login:", error);
            toast.error("Erro no login administrativo", {
              description: "Não foi possível autenticar como administrador"
            });
          } finally {
            setLoading(false);
          }
        } else {
          try {
            await signIn(email.trim(), password.trim());
            console.log("Login successful");
            
            // Special case for admin
            if (expectedRole === 'admin') {
              navigate('/admin', { replace: true });
            } else if (expectedRole === 'business') {
              navigate('/owner', { replace: true });
            } else {
              navigate('/', { replace: true });
            }
          } catch (error) {
            console.error("Login error:", error);
            
            // Create a more helpful error message
            let errorMessage = "Erro de autenticação. Verifique suas credenciais.";
            
            // Try to get more specific error information
            if (error instanceof Error) {
              errorMessage = error.message;
            }
            
            toast.error("Erro ao fazer login", {
              description: errorMessage
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
          
          toast.success("Registro realizado com sucesso!", {
            description: "Verifique seu email para confirmar o cadastro.",
          });
        } catch (error) {
          console.error("Registration error:", error);
          toast.error("Erro ao criar conta", {
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
