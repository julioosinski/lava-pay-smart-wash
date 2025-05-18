
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthContext, type AuthContextType, type SignUpParams } from './AuthContext';
import { redirectBasedOnRole } from './AuthRedirect';
import { useAuthMethods } from './useAuthMethods';
import { toast } from 'sonner';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize all state hooks first, before any other hooks
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  // Then initialize other hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth methods hook last
  const authMethods = useAuthMethods({ 
    setUser, 
    setSession, 
    setLoading, 
    navigate 
  });

  // Wrapper functions to ensure correct signatures
  const signIn = async (email: string, password: string): Promise<void> => {
    await authMethods.signIn(email, password);
  };

  const signUp = async (params: SignUpParams): Promise<void> => {
    const result = await authMethods.signUp(params);
    if (result && result.error) {
      throw result.error;
    }
  };

  const signOut = async (): Promise<void> => {
    await authMethods.signOut();
  };

  // Check for direct admin access
  useEffect(() => {
    const directAdminAccess = localStorage.getItem('direct_admin') === 'true';
    const isOnAdminPath = location.pathname.startsWith('/admin');
    
    // If on admin page with direct access, allow without checking auth
    if (directAdminAccess && isOnAdminPath) {
      console.log("Direct admin access detected on admin page");
      if (loading) {
        setLoading(false);
        setInitialized(true);
      }
    }
  }, [location.pathname, loading]);

  // Effects come after all hooks
  useEffect(() => {
    // A flag to track if the component is still mounted
    let isMounted = true;
    
    const setupAuth = async () => {
      console.log("Setting up auth state listener");
      setLoading(true);
      
      // Check for forced logout flag
      const forcedLogout = localStorage.getItem('force_logout') === 'true';
      if (forcedLogout) {
        console.log("Forced logout flag detected, clearing local state");
        setSession(null);
        setUser(null);
        localStorage.removeItem('force_logout');
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
        return;
      }
      
      // Check for direct admin access
      const directAdminAccess = localStorage.getItem('direct_admin') === 'true';
      const isOnAdminPath = location.pathname.startsWith('/admin');
      
      if (directAdminAccess && isOnAdminPath) {
        console.log("Direct admin access detected on admin page, skipping auth setup");
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
        return;
      }
      
      // Set up the subscription first
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
          if (!isMounted) return; // Prevent state updates on unmounted component
          
          console.log("Auth state changed:", event, newSession ? "Session exists" : "No session");
          
          // Check for direct admin access again
          const hasDirectAdmin = localStorage.getItem('direct_admin') === 'true';
          
          if (event === 'SIGNED_OUT' || (!newSession && event !== 'INITIAL_SESSION')) {
            // Handle both explicit signout and session expiration
            console.log("User signed out or session expired, clearing state");
            setSession(null);
            setUser(null);
            
            // Clear direct admin access on sign out
            if (event === 'SIGNED_OUT') {
              localStorage.removeItem('direct_admin');
            }
            
            // Only redirect if not already on auth page and no direct admin access
            if (location.pathname !== '/auth' && !hasDirectAdmin) {
              console.log("Redirecting to auth page from auth listener");
              navigate('/auth', { replace: true });
            }
          } else if (event === 'SIGNED_IN' && newSession?.user) {
            console.log("User signed in, will redirect based on role");
            // Update session and user for SIGNED_IN event
            setSession(newSession);
            setUser(newSession.user);
            
            // Check if we're on auth page - immediately redirect to role-based page
            if (location.pathname === '/auth') {
              console.log("User logged in and on auth page, redirecting based on role");
              // Get user role and redirect accordingly
              redirectBasedOnRole(newSession.user.id, navigate);
            }
          } else {
            // Update session and user for other events
            setSession(newSession);
            setUser(newSession?.user ?? null);
          }
          
          // Ensure loading is set to false after processing auth state change
          if (!initialized && isMounted) {
            setInitialized(true);
            setLoading(false);
          }
        }
      );

      try {
        // Check for forced logout again before getting session
        if (localStorage.getItem('force_logout') === 'true') {
          console.log("Forced logout flag detected before session check, skipping");
          localStorage.removeItem('force_logout');
          setSession(null);
          setUser(null);
          if (isMounted) {
            setLoading(false);
            setInitialized(true);
          }
          return;
        }
        
        // Check for direct admin access again
        if (directAdminAccess && isOnAdminPath) {
          console.log("Direct admin access detected before session check, skipping");
          if (isMounted) {
            setLoading(false);
            setInitialized(true);
          }
          return;
        }
        
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Checking for existing session:", currentSession ? "Found" : "None");
        
        if (!isMounted) return; // Don't update state if component unmounted
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          console.log("Session found during initialization for user:", currentSession.user.id);
          
          // If on auth page and we have a valid session, redirect based on role
          if (location.pathname === '/auth') {
            console.log("Found existing session on auth page, redirecting");
            redirectBasedOnRole(currentSession.user.id, navigate);
          }
        }
      } catch (error) {
        console.error("Error getting session:", error);
        toast.error("Erro ao verificar a sessão", {
          description: "Não foi possível verificar seu status de login"
        });
      } finally {
        // Always set initialized and loading to false after getting session
        if (isMounted) {
          setInitialized(true);
          setLoading(false);
        }
      }
      
      return () => subscription.unsubscribe();
    };

    // Set a safety timeout to prevent infinite loading state
    const safetyTimeout = setTimeout(() => {
      if (loading && !initialized && isMounted) {
        console.log("Safety timeout triggered - forcing loading state to false");
        setInitialized(true);
        setLoading(false);
      }
    }, 3000);

    setupAuth();
    
    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
    };
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
      {loading && !initialized ? (
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
