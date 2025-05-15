
import { createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';

type SignUpParams = {
  email: string;
  password: string;
  options?: {
    data?: {
      first_name?: string;
      last_name?: string;
    }
  }
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (params: SignUpParams) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
export type { AuthContextType, SignUpParams };
