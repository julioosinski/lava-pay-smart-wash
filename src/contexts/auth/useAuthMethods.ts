
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthMethodsProps {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  navigate: (path: string, options: { replace: boolean }) => void;
}

export function useAuthMethods({ 
  setUser, 
  setSession, 
  setLoading, 
  navigate 
}: AuthMethodsProps) {
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    console.log("Attempting to sign in with email:", email);
    try {
      // Primeiro tentar fazer login normal
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.log("Standard login failed, checking if this is a business owner", error);
        
        // Verificar se existe uma lavanderia com este email e telefone como senha
        const { data: laundries, error: laundryError } = await supabase
          .from('laundries')
          .select('contact_email, contact_phone, owner_id')
          .eq('contact_email', email)
          .eq('contact_phone', password);
        
        if (laundries && laundries.length > 0) {
          const laundryData = laundries[0];
          console.log("Found laundry with matching email/phone, creating user account");
          
          // Criar uma conta para o proprietário
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password
          });
          
          if (signUpError) {
            console.error("Error creating user account:", signUpError);
            setLoading(false);
            throw signUpError;
          }
          
          // Se o usuário foi criado com sucesso, atualize o owner_id da lavanderia
          if (signUpData.user) {
            console.log("User created successfully, updating laundry owner_id");
            
            const { error: updateError } = await supabase
              .from('laundries')
              .update({ owner_id: signUpData.user.id })
              .eq('contact_email', email)
              .eq('contact_phone', password);
            
            if (updateError) {
              console.error("Error updating laundry owner:", updateError);
            } else {
              console.log("Updated laundry owner ID to:", signUpData.user.id);
            }
            
            // Definir o papel do usuário como 'business'
            const { error: profileError } = await supabase
              .from('profiles')
              .update({ role: 'business' })
              .eq('id', signUpData.user.id);
            
            if (profileError) {
              console.error("Error updating user role:", profileError);
            } else {
              console.log("Updated user role to business");
            }
            
            // Fazer login com as credenciais recém-criadas
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ 
              email, 
              password 
            });
            
            if (loginError) {
              console.error("Error logging in after account creation:", loginError);
              setLoading(false);
              throw loginError;
            }
            
            console.log("Login successful after account creation");
            setUser(loginData.user);
            setSession(loginData.session);
            setLoading(false);
            return;
          }
        } else {
          // Se não encontrou lavanderia correspondente, propagar o erro original
          console.log("No matching laundry found with this email/phone");
          setLoading(false);
          throw error;
        }
      } else {
        // Login normal bem-sucedido
        console.log("Standard login successful, user:", data.user?.id);
        setUser(data.user);
        setSession(data.session);

        // Verificar e atualizar o papel do usuário se for um proprietário
        if (data.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();
          
          if (!profileData || !profileData.role) {
            // Verificar se o usuário é um proprietário de lavanderia
            const { data: laundryCheck } = await supabase
              .from('laundries')
              .select('id')
              .eq('owner_id', data.user.id)
              .eq('contact_email', email)
              .maybeSingle();
            
            if (laundryCheck) {
              console.log("Updating user role to business");
              await supabase
                .from('profiles')
                .update({ role: 'business' })
                .eq('id', data.user.id);
            }
          }
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error during sign in:", error);
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Erro ao criar conta",
          description: error.message
        });
        throw error;
      }
      
      console.log("Sign up successful:", data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        setLoading(false);
        throw error;
      }
      setUser(null);
      setSession(null);
      navigate('/auth', { replace: true });
      setLoading(false);
    } catch (error) {
      console.error("Error during sign out:", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Não foi possível desconectar sua sessão."
      });
    }
  };

  return {
    signIn,
    signUp,
    signOut
  };
}
