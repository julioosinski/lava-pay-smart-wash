import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    console.log("Attempting to sign in with email:", email);
    try {
      // Primeiro tentamos encontrar uma lavanderia com este email e telefone como senha
      const { data: laundryData, error: laundryError } = await supabase
        .from('laundries')
        .select('contact_email, contact_phone, owner_id')
        .eq('contact_email', email)
        .eq('contact_phone', password)
        .maybeSingle();
      
      if (laundryData && laundryData.owner_id) {
        console.log("Found laundry with matching email and phone. Trying to fetch existing user...");
        
        // Verificar se já existe um usuário para este owner_id
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', laundryData.owner_id)
          .maybeSingle();
        
        if (userData) {
          // Usuário já existe, tentamos fazer login
          console.log("User exists, attempting login with credentials");
        } else {
          // Criar um novo usuário com estas credenciais
          console.log("Creating user account for business owner");
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password
          });
          
          if (signUpError) {
            console.error("Error creating user account:", signUpError);
            throw signUpError;
          }
          
          // Atualizar o owner_id da lavanderia com o novo usuário
          if (signUpData.user) {
            const { error: updateError } = await supabase
              .from('laundries')
              .update({ owner_id: signUpData.user.id })
              .eq('contact_email', email)
              .eq('contact_phone', password);
            
            if (updateError) {
              console.error("Error updating laundry owner:", updateError);
            } else {
              console.log("Updated laundry owner ID to:", signUpData.user.id);
            }
          }
        }
      }

      // Tenta fazer login normal
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("Sign in error:", error);
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Erro ao entrar",
          description: error.message
        });
        throw error;
      }
      
      console.log("Sign in successful, user:", data.user?.id);
      console.log("Sign in successful, session:", data.session?.access_token ? "Token exists" : "No token");
      setUser(data.user);
      setSession(data.session);

      // Verificar e atualizar o papel do usuário se for um proprietário
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();
        
        if (!profileData || !profileData.role) {
          // Verificar se o usuário é um proprietário de lavanderia
          const { data: laundryCheck, error: laundryCheckError } = await supabase
            .from('laundries')
            .select('id')
            .eq('owner_id', data.user.id)
            .eq('contact_email', email)
            .maybeSingle();
          
          if (laundryCheck) {
            // É um proprietário, atualizar o perfil
            console.log("Updating user role to business");
            const { error: updateRoleError } = await supabase
              .from('profiles')
              .update({ role: 'business' })
              .eq('id', data.user.id);
            
            if (updateRoleError) {
              console.error("Error updating user role:", updateRoleError);
            }
          }
        }
      }
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Erro ao criar conta",
          description: error.message
        });
        throw error;
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        setLoading(false);
        throw error;
      }
      setUser(null);
      setSession(null);
      navigate('/auth', { replace: true });
      setLoading(false);
    } catch (error) {
      console.error("Error during sign out:", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Não foi possível desconectar sua sessão."
      });
    }
  };

  return {
    signIn,
    signUp,
    signOut
  };
}
