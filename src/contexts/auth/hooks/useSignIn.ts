
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { checkLaundryOwnership, updateLaundryOwner, updateUserRole, updateUserContact } from '../utils/authUtils';
import { toast } from 'sonner';

interface SignInProps {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useSignIn = ({ setUser, setSession, setLoading }: SignInProps) => {
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    console.log("Attempting to sign in with email:", email);
    
    try {
      // First, try standard login
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.log("Standard login failed, checking if this is a business owner", error);
        
        // Special case for admin@smartwash.com - direct admin access
        if (email === 'admin@smartwash.com') {
          console.log("Attempting special admin login");
          
          // Try to create or find the admin user
          try {
            // Try sign up first (will fail if user exists, which is fine)
            await supabase.auth.signUp({
              email: email,
              password: password
            });
            
            // Now try login again
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
              email: email,
              password: password
            });
            
            if (loginError) {
              console.error("Admin login failed:", loginError);
              throw new Error("Falha no login do administrador. Tente novamente.");
            }
            
            if (loginData?.user) {
              // Ensure admin role is set
              await updateUserRole(loginData.user.id, 'admin');
              console.log("Admin login successful");
              setUser(loginData.user);
              setSession(loginData.session);
              toast.success("Login de administrador bem-sucedido!");
              return;
            }
          } catch (error) {
            console.error("Error during admin account setup:", error);
            throw new Error("Falha ao configurar conta de administrador.");
          }
        }
          
        // Try to find laundry with given credentials
        try {
          const laundryData = await checkLaundryOwnership(email, password);
          
          if (laundryData) {
            console.log("Found laundry:", laundryData);
            
            try {
              // Try to create an account if it doesn't exist
              const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password
              });
              
              if (signUpError) {
                if (signUpError.message.includes("User already registered")) {
                  console.log("User already exists, trying to sign in again");
                  const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({ 
                    email, 
                    password 
                  });
                  
                  if (retryError) {
                    console.error("Retry sign in failed:", retryError);
                    throw new Error("Não foi possível fazer login como proprietário da lavanderia. Verifique seu email e telefone.");
                  }
                  
                  if (retryData.user) {
                    console.log("Successful retry login, updating laundry owner");
                    await updateLaundryOwner(laundryData.id, retryData.user.id);
                    
                    // Make sure to update user role to business
                    console.log("Setting user role to business");
                    await updateUserRole(retryData.user.id, 'business');
                    
                    // Atualiza o perfil com os dados de contato da lavanderia
                    await updateUserContact(retryData.user.id, email, password);
                    
                    setUser(retryData.user);
                    setSession(retryData.session);
                    toast.success("Login de proprietário bem-sucedido!");
                    return;
                  }
                } else {
                  console.error("Error signing up:", signUpError);
                  throw signUpError;
                }
              } else if (signUpData.user) {
                console.log("Created new user for business owner, updating laundry");
                await updateLaundryOwner(laundryData.id, signUpData.user.id);
                
                // Make sure to update user role to business
                console.log("Setting user role to business for new user");
                await updateUserRole(signUpData.user.id, 'business');
                
                // Atualiza o perfil com os dados de contato da lavanderia
                await updateUserContact(signUpData.user.id, email, password);
                
                setUser(signUpData.user);
                setSession(signUpData.session);
                toast.success("Novo proprietário registrado e login realizado com sucesso!");
                return;
              }
            } catch (error) {
              console.error("Error during business owner authentication:", error);
              throw error;
            }
          }
        } catch (error) {
          console.error("Error in sign in process:", error);
          throw new Error("Erro no banco de dados. Por favor, tente novamente mais tarde.");
        }
      } else {
        console.log("Standard login successful");
        setUser(data.user);
        setSession(data.session);
        toast.success("Login realizado com sucesso!");
      }
    } catch (error) {
      console.error("Error during sign in:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return signIn;
};
