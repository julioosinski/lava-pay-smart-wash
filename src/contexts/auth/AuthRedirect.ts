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
    // Prevent redirect loop detection
    const redirectAttemptKey = "redirect_attempt";
    const redirectAttemptCount = parseInt(sessionStorage.getItem(redirectAttemptKey) || "0", 10);
    
    const redirectUser = async () => {
      // Wait for auth to finish loading
      if (loading) return;

      // Reset redirect counter if user auth state changed
      const userKey = user ? user.id : "no-user";
      const lastUserKey = sessionStorage.getItem("last_user_key");
      
      if (userKey !== lastUserKey) {
        sessionStorage.setItem("last_user_key", userKey);
        sessionStorage.setItem(redirectAttemptKey, "0");
      }
      
      // Prevent infinite redirect loops
      if (redirectAttemptCount > 5) {
        console.warn("Too many redirect attempts detected. Stopping redirect cycle.");
        sessionStorage.setItem(redirectAttemptKey, "0");
        return;
      }
      
      // Increment redirect attempt counter
      sessionStorage.setItem(redirectAttemptKey, (redirectAttemptCount + 1).toString());

      // If we're on auth page with a user, redirect based on role
      if (user && location.pathname === '/auth') {
        await redirectBasedOnRole(user.id, navigate);
        return;
      }
      
      // Check for direct admin access
      const directAdminAccess = localStorage.getItem('direct_admin') === 'true';
      if (directAdminAccess && location.pathname === '/auth') {
        console.log("Auth page: Direct admin access detected, redirecting to admin panel");
        navigate('/admin', { replace: true });
        return;
      }

      if (user) {
        // If on auth page with user, redirect based on role
        if (location.pathname === '/auth') {
          await redirectBasedOnRole(user.id, navigate);
        }
        // Otherwise let protected routes handle their own redirects
      } else if (location.pathname === '/auth') {
        // User is on the auth page, do nothing and let them log in
        console.log("User on auth page, allowing login");
        sessionStorage.setItem(redirectAttemptKey, "0"); // Reset counter
      } else {
        // No user, redirect to auth page with the required role
        const requiredRole = state?.role || 'user';
        console.log(`No authenticated user, redirecting to auth with role: ${requiredRole}`);
        navigate('/auth', { state: { role: requiredRole }, replace: true });
      }
    };

    redirectUser();
    
    // Reset the redirect counter after successful navigation
    return () => {
      if (redirectAttemptCount > 0) {
        sessionStorage.setItem(redirectAttemptKey, "0");
      }
    };
  }, [user, loading, navigate, location.pathname, state]);
}
