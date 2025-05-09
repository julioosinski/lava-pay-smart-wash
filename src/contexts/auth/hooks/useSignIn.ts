
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { checkLaundryOwnership, updateLaundryOwner, updateUserRole, updateUserContact } from '../utils/authUtils';

interface SignInProps {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useSignIn = ({ setUser, setSession, setLoading }: SignInProps) => {
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    console.log("Tentando login com email:", email);
    
    try {
      // Primeiro, tentar login normal
      const { error, data } = await supabase.auth.signInWithPassword({ 
        email, 
        password,
        options: {
          // Evitar problemas com tokens e metadata
          captchaToken: undefined
        }
      });
      
      if (error) {
        console.log("Login padrão falhou, verificando se é proprietário de lavanderia", error);
        
        if (error.message === "Database error querying schema") {
          throw new Error("Erro no banco de dados. Por favor, tente novamente mais tarde.");
        }
        
        // Tentar encontrar lavanderia com as credenciais fornecidas
        try {
          const laundryData = await checkLaundryOwnership(email, password);
          
          if (laundryData) {
            console.log("Lavanderia encontrada:", laundryData);
            
            try {
              // Tentar criar uma conta se não existir
              const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password
              });
              
              if (signUpError) {
                if (signUpError.message.includes("User already registered")) {
                  console.log("Usuário já existe, tentando login novamente");
                  const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({ 
                    email, 
                    password,
                    options: {
                      captchaToken: undefined
                    }
                  });
                  
                  if (retryError) {
                    console.error("Retry sign in failed:", retryError);
                    throw new Error("Não foi possível fazer login como proprietário da lavanderia. Verifique seu email e telefone.");
                  }
                  
                  if (retryData.user) {
                    console.log("Login retry bem-sucedido, atualizando proprietário de lavanderia");
                    await updateLaundryOwner(laundryData.id, retryData.user.id);
                    
                    // Certifique-se de atualizar o papel do usuário para business
                    console.log("Definindo papel do usuário para business");
                    await updateUserRole(retryData.user.id, 'business');
                    
                    // Atualiza o perfil com os dados de contato da lavanderia
                    await updateUserContact(retryData.user.id, email, password);
                    
                    setUser(retryData.user);
                    setSession(retryData.session);
                    return;
                  }
                } else {
                  console.error("Erro ao cadastrar:", signUpError);
                  throw signUpError;
                }
              } else if (signUpData.user) {
                console.log("Criado novo usuário para proprietário, atualizando lavanderia");
                await updateLaundryOwner(laundryData.id, signUpData.user.id);
                
                // Certifique-se de atualizar o papel do usuário para business
                console.log("Definindo papel do usuário para business para novo usuário");
                await updateUserRole(signUpData.user.id, 'business');
                
                // Atualiza o perfil com os dados de contato da lavanderia
                await updateUserContact(signUpData.user.id, email, password);
                
                setUser(signUpData.user);
                setSession(signUpData.session);
                return;
              }
            } catch (error) {
              console.error("Erro durante autenticação do proprietário:", error);
              throw error;
            }
          }
        } catch (error) {
          console.error("Erro no processo de login:", error);
          throw error;
        }
      } else {
        console.log("Login padrão bem-sucedido");
        setUser(data.user);
        setSession(data.session);
      }
    } catch (error) {
      console.error("Erro durante sign in:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return signIn;
};
