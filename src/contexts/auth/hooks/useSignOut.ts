
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
      
      // First clear local state immediately to prevent redirects during logout
      setUser(null);
      setSession(null);
      
      // Add a localStorage flag to indicate a forced logout and clear any Supabase session
      localStorage.setItem('force_logout', 'true');
      localStorage.removeItem('sb-ftvvhclqjwtthquokzii-auth-token');
      
      // Force navigation to home page with replace to prevent back navigation
      console.log("Forcing navigation to home page after logout");
      
      // Then attempt to sign out from Supabase
      try {
        await supabase.auth.signOut({ scope: 'local' });
        console.log("Successfully signed out from Supabase");
        toast.success("Você foi desconectado com sucesso");
      } catch (error: any) {
        // Handle the "Auth session missing" error silently
        if (error.message?.includes('Auth session missing')) {
          console.log("No active session found, logout already completed");
        } else {
          console.error("Error during Supabase signOut:", error);
        }
      }
      
      // Ensure navigation happens even if there are errors with Supabase signOut
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error("Exception during sign out process:", error);
      // Still attempt to redirect even if there was an error
      navigate('/', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return signOut;
};
