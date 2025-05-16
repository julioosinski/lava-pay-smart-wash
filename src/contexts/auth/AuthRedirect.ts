
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

// Track the last redirect path to prevent loops
let lastRedirectPath = '';
let redirectCount = 0;
const MAX_REDIRECTS = 3;

export function useAuthRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { role?: string } | null;
  
  useEffect(() => {
    // Global redirect counter across renders
    const redirectAttemptKey = "redirect_attempt";
    const redirectAttemptCount = parseInt(sessionStorage.getItem(redirectAttemptKey) || "0", 10);
    
    const redirectUser = async () => {
      // Wait for auth to finish loading
      if (loading) return;

      // Reset redirect counter if user auth state changed or path changed
      const userKey = user ? user.id : "no-user";
      const pathKey = location.pathname;
      const lastUserKey = sessionStorage.getItem("last_user_key");
      const lastPathKey = sessionStorage.getItem("last_path_key");
      
      if (userKey !== lastUserKey || pathKey !== lastPathKey) {
        sessionStorage.setItem("last_user_key", userKey);
        sessionStorage.setItem("last_path_key", pathKey);
        // Only reset the counter when user state changes, not on every path change
        if (userKey !== lastUserKey) {
          console.log("User state changed, resetting redirect counter");
          sessionStorage.setItem(redirectAttemptKey, "0");
          redirectCount = 0;
        }
      }
      
      // Hard limit on redirects to prevent infinite loops
      if (redirectAttemptCount > MAX_REDIRECTS) {
        console.warn(`Too many redirect attempts (${redirectAttemptCount}). Stopping redirect cycle.`);
        sessionStorage.setItem(redirectAttemptKey, "0");
        redirectCount = 0;
        return;
      }
      
      // Check if we're trying to redirect to the same path - prevents loops
      if (lastRedirectPath === location.pathname && redirectCount > 0) {
        console.warn(`Preventing redirect loop to ${location.pathname}`);
        return;
      }

      // Increment redirect attempt counter
      redirectCount++;
      sessionStorage.setItem(redirectAttemptKey, (redirectAttemptCount + 1).toString());

      // Check for direct admin access first - this is highest priority
      const directAdminAccess = localStorage.getItem('direct_admin') === 'true';
      
      // Main logic branches
      if (directAdminAccess) {
        // Direct admin access has priority
        if (location.pathname === '/auth') {
          console.log("Auth page: Direct admin access detected, redirecting to admin panel");
          lastRedirectPath = '/admin';
          navigate('/admin', { replace: true });
        } else if (!location.pathname.startsWith('/admin')) {
          // If not already on an admin page, redirect there
          lastRedirectPath = '/admin';
          navigate('/admin', { replace: true });
        }
      } else if (user) {
        // Authenticated user flow
        if (location.pathname === '/auth') {
          // Delay to prevent redirect loops
          setTimeout(() => {
            lastRedirectPath = 'role-based';
            redirectBasedOnRole(user.id, navigate);
          }, 200);
        }
        // Otherwise let protected routes handle their own redirects
      } else if (location.pathname === '/auth') {
        // User is on the auth page without being logged in, let them log in
        console.log("User on auth page, allowing login");
        sessionStorage.setItem(redirectAttemptKey, "0");
        redirectCount = 0;
      } else {
        // No authenticated user, redirect to auth
        const requiredRole = state?.role || 'user';
        console.log(`No authenticated user, redirecting to auth with role: ${requiredRole}`);
        lastRedirectPath = '/auth';
        navigate('/auth', { state: { role: requiredRole }, replace: true });
      }
    };

    redirectUser();
    
    // Reset the redirect counter after successful navigation
    return () => {
      if (redirectAttemptCount > 0) {
        // Only reset when unmounting if we've had redirects
        sessionStorage.setItem(redirectAttemptKey, "0");
      }
    };
  }, [user, loading, navigate, location.pathname, state]);
}
