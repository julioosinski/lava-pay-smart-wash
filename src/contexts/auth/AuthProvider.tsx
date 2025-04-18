
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthContext, type AuthContextType } from './AuthContext';
import { redirectBasedOnRole } from './AuthRedirect';
import { useAuthMethods } from './useAuthMethods';
import { toast } from 'sonner';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize all state hooks first, before any other hooks
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Then initialize other hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth methods hook last
  const { signIn, signUp, signOut } = useAuthMethods({ 
    setUser, 
    setSession, 
    setLoading, 
    navigate 
  });

  // Effects come after all hooks
  useEffect(() => {
    const setupAuth = async () => {
      console.log("Setting up auth state listener");
      setLoading(true);
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
          console.log("Auth state changed:", event);
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          if (event === 'SIGNED_IN' && newSession?.user) {
            console.log("User signed in, will redirect based on role");
            
            // Check if we're already on a protected route
            const isOnAuthPage = location.pathname === '/auth';
            
            if (isOnAuthPage) {
              // Only redirect if on auth page
              setTimeout(() => {
                redirectBasedOnRole(newSession.user.id, navigate);
              }, 0);
            }
          } else if (event === 'SIGNED_OUT') {
            console.log("User signed out");
            setLoading(false);
            
            // Redirect to auth page on sign out if not already there
            if (location.pathname !== '/auth') {
              navigate('/auth', { replace: true });
            }
          }
        }
      );

      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Checking for existing session:", currentSession ? "Found" : "None");
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          console.log("Session found during initialization for user:", currentSession.user.id);
          
          // Check if we're already on a protected route
          const isOnAuthPage = location.pathname === '/auth';
          
          if (isOnAuthPage) {
            // Only redirect if on auth page
            setTimeout(() => {
              redirectBasedOnRole(currentSession.user.id, navigate);
            }, 0);
          }
        } else {
          console.log("No session found, setting loading to false");
          setLoading(false);
          
          // If no session and on a protected route, the ProtectedRoute component will handle redirection
        }
      } catch (error) {
        console.error("Error getting session:", error);
        setLoading(false);
        toast.error("Erro ao verificar a sessão");
      }
      
      return () => subscription.unsubscribe();
    };

    const safetyTimeout = setTimeout(() => {
      console.log("Safety timeout triggered - forcing loading state to false");
      setLoading(false);
    }, 5000);

    setupAuth();
    
    return () => clearTimeout(safetyTimeout);
  }, [navigate, location.pathname]);

  const contextValue: AuthContextType = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-lavapay-600 mx-auto mb-4" />
            <p className="text-lg font-medium">Carregando autenticação...</p>
            <p className="text-sm text-gray-500">Por favor, aguarde um momento...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}
