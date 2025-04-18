
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
    console.log("Attempting to sign in with email:", email);
    
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.log("Standard login failed, checking if this is a business owner", error);
        
        // Try to find laundry with given credentials
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
                  await updateUserRole(retryData.user.id, 'business');
                  
                  // Atualiza o perfil com os dados de contato da lavanderia
                  await updateUserContact(retryData.user.id, email, password);
                  
                  setUser(retryData.user);
                  setSession(retryData.session);
                  return;
                }
              } else {
                console.error("Error signing up:", signUpError);
                throw signUpError;
              }
            } else if (signUpData.user) {
              console.log("Created new user for business owner, updating laundry");
              await updateLaundryOwner(laundryData.id, signUpData.user.id);
              await updateUserRole(signUpData.user.id, 'business');
              
              // Atualiza o perfil com os dados de contato da lavanderia
              await updateUserContact(signUpData.user.id, email, password);
              
              // Login after signup
              const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ 
                email, 
                password 
              });
              
              if (loginError) {
                console.error("Error logging in after signup:", loginError);
                throw loginError;
              }
              
              setUser(loginData.user);
              setSession(loginData.session);
              return;
            }
          } catch (error) {
            console.error("Error during business owner authentication:", error);
            throw error;
          }
        } else {
          console.log("No matching laundry found with this email/phone");
          throw new Error("no matching laundry found");
        }
      } else {
        console.log("Standard login successful, user:", data.user?.id);
        setUser(data.user);
        setSession(data.session);

        if (data.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();
          
          if (!profileData?.role) {
            const { data: laundryCheck } = await supabase
              .from('laundries')
              .select('id')
              .eq('owner_id', data.user.id)
              .eq('contact_email', email)
              .maybeSingle();
            
            if (laundryCheck) {
              console.log("User is a laundry owner, updating role");
              await updateUserRole(data.user.id, 'business');
              await updateUserContact(data.user.id, email, password);
            }
          }
        }
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
