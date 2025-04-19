
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdminStatus(userId?: string) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!userId) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();
          
        if (error) {
          console.error("Error checking user role:", error);
          return;
        }
        
        setIsAdmin(data?.role === 'admin');
        console.log("User is admin:", data?.role === 'admin');
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    
    checkAdminRole();
  }, [userId]);

  return isAdmin;
}
