
import { supabase } from '@/integrations/supabase/client';

export async function redirectBasedOnRole(userId: string, navigate: (path: string, options: { replace: boolean }) => void) {
  try {
    console.log("Checking role for user ID:", userId);
    
    // First check if the user is a laundry owner by querying the laundries table
    const { data: laundryCheck, error: laundryError } = await supabase
      .from('laundries')
      .select('id')
      .eq('owner_id', userId)
      .limit(1);
    
    if (laundryCheck && laundryCheck.length > 0) {
      console.log(`User ${userId} is a laundry owner, found laundry: ${laundryCheck[0].id}`);
      await updateUserRoleIfNeeded(userId, 'business');
      navigate('/owner', { replace: true });
      return;
    } else {
      console.log(`User ${userId} is not a laundry owner, no laundries found with owner_id = ${userId}`);
    }
    
    // If no laundries found, check the profile role
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

// Helper function to update user role if needed
async function updateUserRoleIfNeeded(userId: string, role: 'business' | 'user' | 'admin') {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (data?.role !== role) {
      console.log(`Updating user ${userId} role from ${data?.role} to ${role}`);
      
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
        
      if (error) {
        console.error("Error updating user role:", error);
      } else {
        console.log("Role successfully updated to", role);
      }
    } else {
      console.log(`User ${userId} already has role: ${role}, no update needed`);
    }
  } catch (error) {
    console.error("Error in updateUserRoleIfNeeded:", error);
  }
}
