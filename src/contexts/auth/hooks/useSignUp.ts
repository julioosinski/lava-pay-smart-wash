
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SignUpProps {
  setLoading: (loading: boolean) => void;
}

export const useSignUp = ({ setLoading }: SignUpProps) => {
  // Initialize hooks at the top level
  const { toast } = useToast();

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao criar conta",
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
