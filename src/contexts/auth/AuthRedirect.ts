
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
    
    // If we reach here, use the role to determine where to redirect
    if (role === 'admin') {
      console.log("Admin role detected, redirecting to admin page");
      navigate('/admin', { replace: true });
      return;
    } else if (role === 'business') {
      console.log("Business role detected, redirecting to owner page");
      navigate('/owner', { replace: true });
      return;
    }
    
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
      
      // Fix the type comparison by ensuring we're comparing string values
      if (typeof role === 'string' && role === 'business') {
        console.log("User has business role but no laundries. Creating a test laundry...");
        
        try {
          // Create a test laundry for this business user
          const testLaundryName = `Test Laundry ${Math.floor(Math.random() * 1000)}`;
          const { data: newLaundry, error: createError } = await supabase
            .from('laundries')
            .insert({
              name: testLaundryName,
              address: '123 Test Street, Test City',
              contact_email: 'test@example.com',
              contact_phone: '(555) 123-4567',
              owner_id: userId,
              status: 'active'
            })
            .select()
            .single();
            
          if (createError) {
            console.error("Error creating test laundry:", createError);
            toast.error("Erro ao criar lavanderia de teste");
          } else if (newLaundry) {
            console.log("Successfully created test laundry:", newLaundry);
            toast.success("Lavanderia de teste criada com sucesso");
            navigate('/owner', { replace: true });
            return;
          }
        } catch (error) {
          console.error("Error in test laundry creation:", error);
          toast.error("Erro ao criar lavanderia de teste");
        }
      }
    }

    console.log("No specific role detected or user role, redirecting to home");
    navigate('/', { replace: true });
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
