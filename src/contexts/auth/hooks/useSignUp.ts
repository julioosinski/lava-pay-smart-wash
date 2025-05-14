
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SignUpProps {
  setLoading: (loading: boolean) => void;
}

export const useSignUp = ({ setLoading }: SignUpProps) => {
  const toast = useToast((state) => state.toast);

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        toast.error("Erro ao criar conta", {
          description: error.message
        });
        throw error;
      }
      
      console.log("Sign up successful");
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return signUp;
};
