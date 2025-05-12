
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAdminStatus(userId?: string) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!userId) return;
      
      try {
        // First check direct admin value in localStorage (for fallback login)
        const directAdmin = localStorage.getItem('direct_admin') === 'true';
        if (directAdmin) {
          console.log("Direct admin access detected from localStorage");
          setIsAdmin(true);
          return;
        }
        
        // Then check if the user email is admin@smartwash.com (hardcoded admin)
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('contact_email, role')
          .eq('id', userId)
          .maybeSingle();
          
        if (userError) {
          console.error("Error fetching user data:", userError);
          return;
        }
        
        // Check if email is admin@smartwash.com or role is admin
        const isSpecialAdmin = userData?.contact_email === 'admin@smartwash.com';
        const hasAdminRole = userData?.role === 'admin';
        
        setIsAdmin(isSpecialAdmin || hasAdminRole);
        console.log("User admin status:", isSpecialAdmin || hasAdminRole, 
                    "Special admin:", isSpecialAdmin, 
                    "Admin role:", hasAdminRole);
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast.error("Erro ao verificar status de administrador");
      }
    };
    
    checkAdminRole();
  }, [userId]);

  return isAdmin;
}
