
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SignOutProps {
  setUser: (user: null) => void;
  setSession: (session: null) => void;
  setLoading: (loading: boolean) => void;
  navigate: (path: string, options: { replace: boolean }) => void;
}

export const useSignOut = ({ setUser, setSession, setLoading, navigate }: SignOutProps) => {
  const { toast } = useToast();

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }
      setUser(null);
      setSession(null);
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error("Error during sign out:", error);
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Não foi possível desconectar sua sessão."
      });
    } finally {
      setLoading(false);
    }
  };

  return signOut;
};
