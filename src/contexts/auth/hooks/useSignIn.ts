
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { checkLaundryOwnership, updateLaundryOwner, updateUserRole } from '../utils/authUtils';

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
        const laundryData = await checkLaundryOwnership(email, password);
        
        if (laundryData) {
          console.log("Found laundry:", laundryData);
          
          try {
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
                
                if (retryError) throw retryError;
                
                if (retryData.user) {
                  await updateLaundryOwner(laundryData.id, retryData.user.id);
                  await updateUserRole(retryData.user.id, 'business');
                }
                
                setUser(retryData.user);
                setSession(retryData.session);
                return;
              }
              throw signUpError;
            }
            
            if (signUpData.user) {
              await updateLaundryOwner(laundryData.id, signUpData.user.id);
              await updateUserRole(signUpData.user.id, 'business');
              
              const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ 
                email, 
                password 
              });
              
              if (loginError) throw loginError;
              
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
          throw error;
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
              await updateUserRole(data.user.id, 'business');
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
