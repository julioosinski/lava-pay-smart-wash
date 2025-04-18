
import { supabase } from '@/integrations/supabase/client';

export async function redirectBasedOnRole(userId: string, navigate: (path: string, options: { replace: boolean }) => void) {
  try {
    console.log("Checking role for user ID:", userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching role:", error);
      return;
    }
    
    console.log("Profile data from database:", JSON.stringify(data));
    
    const role = data?.role;
    console.log("User role detected from database:", role);
    
    if (role === 'business') {
      console.log("Business role detected, redirecting to /owner");
      navigate('/owner', { replace: true });
    } else if (role === 'admin') {
      console.log("Admin role detected, redirecting to /admin");
      navigate('/admin', { replace: true });
    } else {
      console.log("Standard user role, redirecting to home");
      navigate('/', { replace: true });
    }
  } catch (error) {
    console.error("Error in redirectBasedOnRole:", error);
  }
}
