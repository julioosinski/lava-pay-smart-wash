
import { User, Session } from '@supabase/supabase-js';
import { useSignIn } from './hooks/useSignIn';
import { useSignUp } from './hooks/useSignUp';
import { useSignOut } from './hooks/useSignOut';

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
  const signIn = useSignIn({ setUser, setSession, setLoading });
  const signUp = useSignUp({ setLoading });
  const signOut = useSignOut({ setUser, setSession, setLoading, navigate });

  return {
    signIn,
    signUp,
    signOut
  };
}
