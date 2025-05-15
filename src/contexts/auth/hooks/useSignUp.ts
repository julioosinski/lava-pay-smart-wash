
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

interface SignUpHookProps {
  setLoading: (loading: boolean) => void;
}

export function useSignUp({ setLoading }: SignUpHookProps) {
  const [error, setError] = useState<Error | null>(null);

  async function signUp({ email, password, options }: SignUpParams) {
    try {
      // Fix the function call to match the expected signature from Supabase
      const response = await supabase.auth.signUp({
        email,
        password,
        options
      });

      if (response.error) {
        setError(response.error);
        return { error: response.error };
      }

      return { data: response.data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An unknown error occurred during sign up");
      setError(error);
      return { error };
    }
  }

  return { signUp, error };
}
