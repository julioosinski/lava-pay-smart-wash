import { useState } from "react";
import { toast } from "./use-toast";
import { useAuth } from "@/contexts/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

// Define schemas for authentication forms
const loginSchema = z.object({
  email: z.string().email("Insira um email válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

const signUpSchema = z.object({
  email: z.string().email("Insira um email válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  first_name: z.string().min(2, "Nome muito curto").max(50, "Nome muito longo"),
  last_name: z.string().min(2, "Sobrenome muito curto").max(50, "Sobrenome muito longo"),
});

// Type for sign up form data
type SignUpFormData = z.infer<typeof signUpSchema>;

// Type for login form data
type LoginFormData = z.infer<typeof loginSchema>;

export function useAuthForm(type: 'login' | 'signup', role?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Use appropriate schema based on form type
  const schema = type === 'login' ? loginSchema : signUpSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: type === 'login' 
      ? { email: "", password: "" }
      : { email: "", password: "", first_name: "", last_name: "" },
  });

  async function onSubmit(data: LoginFormData | SignUpFormData) {
    setIsLoading(true);
    
    try {
      if (type === 'login') {
        const { email, password } = data as LoginFormData;
        
        // Fix the function call to match the expected signature
        const { error } = await signIn({ email, password });
        
        if (error) {
          console.error("Login error:", error);
          // Use the simplified toast interface
          toast.error("Falha no login: " + error.message);
          return;
        }
        
        // Use the simplified toast interface
        toast.success("Login bem-sucedido!");
        
        // Redirect based on role
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'business') {
          navigate('/owner');
        } else {
          navigate('/');
        }
      } else {
        const { email, password, first_name, last_name } = data as SignUpFormData;
        
        // Fix the function call to match the expected signature
        const { error } = await signUp({ 
          email, 
          password, 
          options: { 
            data: { first_name, last_name } 
          }
        });
        
        if (error) {
          console.error("Signup error:", error);
          // Use the simplified toast interface
          toast.error("Falha no cadastro: " + error.message);
          return;
        }
        
        // Use the simplified toast interface
        toast.success("Cadastro realizado com sucesso! Verifique seu email.");
        
        navigate('/auth');
      }
    } catch (error) {
      console.error("Auth error:", error);
      // Use the simplified toast interface
      toast.error(`Erro na autenticação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    form,
    isLoading,
    onSubmit,
  };
}
