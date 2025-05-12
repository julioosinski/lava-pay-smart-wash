import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './index';
import { supabase } from '@/integrations/supabase/client';

// Add the missing exported function
export const redirectBasedOnRole = async (userId: string, navigate: (path: string, options?: { replace: boolean }) => void) => {
  try {
    // Check for direct admin access
    const directAdminAccess = localStorage.getItem('direct_admin') === 'true';
    if (directAdminAccess) {
      console.log("redirectBasedOnRole: Direct admin access detected, redirecting to admin panel");
      navigate('/admin', { replace: true });
      return;
    }
    
    // Otherwise check profile in database
    const { data: userData, error } = await supabase
      .from('profiles')
      .select('contact_email, role')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error("Error fetching user role:", error);
      navigate('/', { replace: true });
      return;
    }
    
    // Special case for admin@smartwash.com
    if (userData?.contact_email === 'admin@smartwash.com') {
      console.log("redirectBasedOnRole: admin@smartwash.com detected, redirecting to admin panel");
      navigate('/admin', { replace: true });
      return;
    }
    
    // Choose redirection based on user role
    const userRole = userData?.role;
    
    console.log("redirectBasedOnRole: redirecting based on role:", userRole);
    
    if (userRole === 'admin') {
      navigate('/admin', { replace: true });
    } else if (userRole === 'business') {
      navigate('/owner', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  } catch (err) {
    console.error("Error in auth redirect:", err);
    navigate('/', { replace: true });
  }
};

export function useAuthRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { role?: string } | null;
  
  useEffect(() => {
    const redirectUser = async () => {
      // Wait for auth to finish loading
      if (loading) return;

      if (user) {
        // If we have a logged-in user, check their role and redirect
        await redirectBasedOnRole(user.id, navigate);
      } else if (location.pathname === '/auth') {
        // User is on the auth page, do nothing and let them log in
        console.log("User on auth page, allowing login");
      } else {
        // No user, redirect to auth page with the required role
        const requiredRole = state?.role || 'user';
        console.log(`No authenticated user, redirecting to auth with role: ${requiredRole}`);
        navigate('/auth', { state: { role: requiredRole }, replace: true });
      }
    };

    redirectUser();
  }, [user, loading, navigate, location.pathname, state]);
}
