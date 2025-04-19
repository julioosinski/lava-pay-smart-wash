
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
      
      try {
        // Then sign out from Supabase
        await supabase.auth.signOut();
        console.log("Successfully signed out from Supabase");
        toast.success("Você foi desconectado com sucesso");
      } catch (error: any) {
        // Handle the "Auth session missing" error gracefully
        if (error.message?.includes('Auth session missing')) {
          console.log("No active session found, proceeding with logout");
          // We continue the logout process as the session is already gone
        } else {
          // For other errors, show a toast but still proceed with navigation
          console.error("Error during Supabase signOut:", error);
          toast.error("Erro ao sair da sua conta");
        }
      }
      
    } catch (error) {
      console.error("Exception during sign out process:", error);
      toast.error("Erro ao sair da sua conta");
    } finally {
      // Always navigate to auth page and reset loading state
      console.log("Navigating to auth page after logout");
      navigate('/auth', { replace: true });
      setLoading(false);
    }
  };

  return signOut;
};
