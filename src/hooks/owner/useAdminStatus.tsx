
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user?.id) return setIsLoading(false);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Error checking user role:", error);
          return setIsLoading(false);
        }
        
        setIsAdmin(data?.role === 'admin');
        console.log("User is admin:", data?.role === 'admin');
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminRole();
  }, [user?.id]);

  return { isAdmin, isLoading };
}
