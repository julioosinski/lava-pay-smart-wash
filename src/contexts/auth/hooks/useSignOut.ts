
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
    try {
      console.log("Starting logout process");
      setLoading(true);
      
      // First clear local state to ensure UI updates immediately
      setUser(null);
      setSession(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error during Supabase signOut:", error);
        toast.error("Erro ao sair da sua conta");
      } else {
        console.log("Successfully signed out from Supabase");
        toast.success("Você foi desconectado com sucesso");
        
        // Forced navigation to auth page with replace to prevent going back
        setTimeout(() => {
          console.log("Navigating to auth page after logout");
          navigate('/auth', { replace: true });
        }, 100);
      }
    } catch (error) {
      console.error("Exception during sign out process:", error);
      toast.error("Erro ao sair da sua conta");
      
      // Even on error, force navigation to auth
      navigate('/auth', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return signOut;
};
