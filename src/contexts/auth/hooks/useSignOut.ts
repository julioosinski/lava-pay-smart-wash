
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SignOutProps {
  setUser: (user: null) => void;
  setSession: (session: null) => void;
  setLoading: (loading: boolean) => void;
  navigate: (path: string, options: { replace: boolean }) => void;
}

export const useSignOut = ({ setUser, setSession, setLoading, navigate }: SignOutProps) => {
  const signOut = async () => {
    setLoading(true);
    try {
      // First, reset the local state regardless of API response
      setUser(null);
      setSession(null);
      
      // Then try to sign out from Supabase
      try {
        await supabase.auth.signOut();
      } catch (error) {
        // We've already reset local state, so just log the error
        console.log("Supabase signOut API error (non-critical):", error);
        // This is non-critical as we've already cleared local state
      }
      
      // Redirect to auth page
      navigate('/auth', { replace: true });
      toast.success("Você foi desconectado com sucesso");
    } catch (error) {
      console.error("Error during sign out:", error);
      toast.error("Erro ao sair da sua conta");
    } finally {
      setLoading(false);
    }
  };

  return signOut;
};
