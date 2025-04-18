
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Check user role on sign in
          try {
            console.log("Checking user role after sign in event");
            const { data, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
              
            if (error) {
              console.error("Error fetching user role:", error);
              return;
            }
            
            console.log("User role on auth state change:", data?.role);
            
            // Redirect based on role
            if (data?.role === 'business') {
              console.log("Business user signed in, redirecting to owner page");
              navigate('/owner', { replace: true });
            } else if (data?.role === 'admin') {
              console.log("Admin user signed in, redirecting to admin page");
              navigate('/admin', { replace: true });
            } else {
              console.log("Regular user signed in, redirecting to home page");
              navigate('/', { replace: true });
            }
          } catch (error) {
            console.error("Error checking user role:", error);
          }
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Checking for existing session:", session ? "Found" : "None");
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        console.log("Session found during initialization for user:", session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    console.log("Attempting to sign in with email:", email);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Sign in error:", error);
      throw error;
    }
    
    console.log("Sign in successful, user:", data.user?.id);
    console.log("Sign in successful, session:", data.session?.access_token ? "Token exists" : "No token");
    setUser(data.user);
    setSession(data.session);
    
    // Get user role and redirect accordingly
    if (data.user) {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          return;
        }
        
        console.log("User role after sign in:", profileData?.role);
        
        // Redirect based on role
        if (profileData?.role === 'business') {
          console.log("Redirecting business user to owner page");
          navigate('/owner', { replace: true });
        } else if (profileData?.role === 'admin') {
          console.log("Redirecting admin user to admin page");
          navigate('/admin', { replace: true });
        } else {
          console.log("Redirecting regular user to home page");
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error("Error redirecting after sign in:", error);
      }
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }
      setUser(null);
      setSession(null);
      navigate('/auth');
    } catch (error) {
      console.error("Error during sign out:", error);
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Não foi possível desconectar sua sessão."
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, signIn, signUp, signOut }}>
      {children}
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
