
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
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("Sign in error:", error);
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Erro ao entrar",
          description: error.message
        });
        throw error;
      }
      
      console.log("Sign in successful, user:", data.user?.id);
      console.log("Sign in successful, session:", data.session?.access_token ? "Token exists" : "No token");
      setUser(data.user);
      setSession(data.session);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Erro ao criar conta",
          description: error.message
        });
        throw error;
      }
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
