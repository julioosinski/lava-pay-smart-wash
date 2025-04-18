
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean; // Add loading state to the context
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Helper function to redirect based on role
  const redirectBasedOnRole = async (userId: string) => {
    try {
      console.log("Checking role for user ID:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching role:", error);
        setLoading(false); // Make sure to set loading to false even if there's an error
        return;
      }
      
      console.log("Profile data from database:", JSON.stringify(data));
      
      const role = data?.role;
      console.log("User role detected from database:", role);
      
      if (role === 'business') {
        console.log("Business role detected, redirecting to /owner");
        navigate('/owner', { replace: true });
      } else if (role === 'admin') {
        console.log("Admin role detected, redirecting to /admin");
        navigate('/admin', { replace: true });
      } else {
        console.log("Standard user role, redirecting to home");
        navigate('/', { replace: true });
      }
      
      setLoading(false); // Set loading to false after redirection
    } catch (error) {
      console.error("Error in redirectBasedOnRole:", error);
      setLoading(false); // Make sure to set loading to false even if there's an error
    }
  };

  useEffect(() => {
    const setupAuth = async () => {
      console.log("Setting up auth state listener");
      setLoading(true); // Set loading to true at the start
      
      // Set up auth state listener first
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth state changed:", event);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (event === 'SIGNED_IN' && session?.user) {
            console.log("User signed in, will redirect based on role");
            await redirectBasedOnRole(session.user.id);
          } else if (event === 'SIGNED_OUT') {
            setLoading(false); // Set loading to false after sign out
          }
        }
      );

      // Then check for existing session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Checking for existing session:", session ? "Found" : "None");
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log("Session found during initialization for user:", session.user.id);
          await redirectBasedOnRole(session.user.id);
        } else {
          setLoading(false); // Set loading to false if no session found
        }
      } catch (error) {
        console.error("Error getting session:", error);
        setLoading(false); // Set loading to false if there's an error
      }
      
      return () => subscription.unsubscribe();
    };

    setupAuth();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    setLoading(true); // Set loading to true before sign in
    console.log("Attempting to sign in with email:", email);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("Sign in error:", error);
        setLoading(false); // Set loading to false if there's an error
        throw error;
      }
      
      console.log("Sign in successful, user:", data.user?.id);
      console.log("Sign in successful, session:", data.session?.access_token ? "Token exists" : "No token");
      setUser(data.user);
      setSession(data.session);
      
      // Redirect is now handled by the auth state change listener
      // but we'll ensure it happens here as well for immediate feedback
      if (data.user) {
        await redirectBasedOnRole(data.user.id);
      }
    } catch (error) {
      setLoading(false); // Set loading to false if there's an error
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true); // Set loading to true before sign up
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setLoading(false); // Set loading to false if there's an error
        throw error;
      }
      // Loading will be set to false by the auth state change listener
    } catch (error) {
      setLoading(false); // Set loading to false if there's an error
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true); // Set loading to true before sign out
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        setLoading(false); // Set loading to false if there's an error
        throw error;
      }
      setUser(null);
      setSession(null);
      navigate('/auth', { replace: true });
      setLoading(false); // Set loading to false after sign out
    } catch (error) {
      console.error("Error during sign out:", error);
      setLoading(false); // Set loading to false if there's an error
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Não foi possível desconectar sua sessão."
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, signIn, signUp, signOut, loading }}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavapay-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium">Carregando autenticação...</p>
            <p className="text-sm text-gray-500">Por favor, aguarde um momento...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
