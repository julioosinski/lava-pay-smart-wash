
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function redirectBasedOnRole(userId: string, navigate: (path: string, options: { replace: boolean }) => void) {
  try {
    console.log("Checking role for user ID:", userId);
    
    // First check if there's a profile with role for this user
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      // Don't return yet, we'll check for laundries first
    }

    const role = profileData?.role;
    console.log("User role from profile:", role);
    
    // Then check if the user has any laundries (business owner)
    const { data: laundryCheck, error: laundryError } = await supabase
      .from('laundries')
      .select('id')
      .eq('owner_id', userId)
      .limit(1);

    if (laundryError) {
      console.error("Error checking laundries:", laundryError);
      // Continue execution to check user roles
    }
    
    if (laundryCheck && laundryCheck.length > 0) {
      console.log(`User ${userId} is a laundry owner, found laundry:`, laundryCheck[0]);
      // Update user role to business if they own a laundry
      await updateUserRoleIfNeeded(userId, 'business');
      console.log("Redirecting to owner dashboard");
      navigate('/owner', { replace: true });
      return;
    } else {
      console.log(`User ${userId} has no laundries associated`);
      
      // If user already has business role, try to assign a test laundry
      if (role === 'business') {
        console.log("User has business role but no laundries. Checking for available laundries...");
        
        // Find a laundry without an owner and assign it to this user
        const { data: availableLaundries, error: availableError } = await supabase
          .from('laundries')
          .select('id')
          .is('owner_id', null)
          .limit(1);
        
        if (availableError) {
          console.error("Error checking for available laundries:", availableError);
        } else if (availableLaundries && availableLaundries.length > 0) {
          console.log("Found available laundry, assigning to user:", availableLaundries[0].id);
          
          const { error: updateError } = await supabase
            .from('laundries')
            .update({ owner_id: userId })
            .eq('id', availableLaundries[0].id);
          
          if (updateError) {
            console.error("Error assigning laundry to user:", updateError);
            toast.error("Erro ao atribuir lavanderia ao proprietário");
          } else {
            console.log("Successfully assigned laundry to user, redirecting to owner dashboard");
            toast.success("Lavanderia atribuída ao proprietário com sucesso");
            navigate('/owner', { replace: true });
            return;
          }
        } else {
          console.log("No available laundries found for assignment");
          toast.warning("Não há lavanderias disponíveis para atribuir ao proprietário");
        }
      }
    }

    // If we reach here, use the role to determine where to redirect
    if (role === 'admin') {
      console.log("Admin role detected, redirecting to admin page");
      navigate('/admin', { replace: true });
    } else if (role === 'business') {
      console.log("Business role detected, redirecting to owner page");
      navigate('/owner', { replace: true });
    } else {
      console.log("No specific role detected or user role, redirecting to home");
      navigate('/', { replace: true });
    }
  } catch (error) {
    console.error("Error in redirectBasedOnRole:", error);
    toast.error("Erro no redirecionamento baseado no papel do usuário");
    // Fallback to home page
    navigate('/', { replace: true });
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
