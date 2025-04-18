
import { supabase } from '@/integrations/supabase/client';

export async function redirectBasedOnRole(userId: string, navigate: (path: string, options: { replace: boolean }) => void) {
  try {
    console.log("Checking role for user ID:", userId);
    
    // First check if the user has any laundries (business owner)
    const { data: laundryCheck, error: laundryError } = await supabase
      .from('laundries')
      .select('id')
      .eq('owner_id', userId)
      .limit(1);

    if (laundryError) {
      console.error("Error checking laundries:", laundryError);
      return;
    }
    
    if (laundryCheck && laundryCheck.length > 0) {
      console.log(`User ${userId} is a laundry owner, found laundry:`, laundryCheck[0]);
      // Update user role to business if they own a laundry
      await updateUserRoleIfNeeded(userId, 'business');
      navigate('/owner', { replace: true });
      return;
    }

    // Check profile role for other cases
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return;
    }

    const role = profileData?.role;
    console.log("User role from profile:", role);

    if (role === 'admin') {
      navigate('/admin', { replace: true });
    } else if (role === 'business') {
      navigate('/owner', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  } catch (error) {
    console.error("Error in redirectBasedOnRole:", error);
  }
}

async function updateUserRoleIfNeeded(userId: string, role: 'business' | 'user' | 'admin') {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return;
    }

    if (profile?.role !== role) {
      console.log(`Updating user ${userId} role from ${profile?.role} to ${role}`);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (updateError) {
        console.error("Error updating role:", updateError);
      } else {
        console.log("Role successfully updated to:", role);
      }
    }
  } catch (error) {
    console.error("Error in updateUserRoleIfNeeded:", error);
  }
}
