
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define a type for the roles to ensure consistent typing
type UserRole = 'admin' | 'business' | 'user';

export async function redirectBasedOnRole(userId: string, navigate: (path: string, options: { replace: boolean }) => void) {
  try {
    console.log("Checking role for user ID:", userId);
    
    // Check for direct admin access
    const directAdminAccess = localStorage.getItem('direct_admin') === 'true';
    if (directAdminAccess) {
      console.log("Direct admin access detected, redirecting to admin page");
      navigate('/admin', { replace: true });
      return;
    }
    
    // Special case for admin@smartwash.com
    const { data: emailCheck, error: emailError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();
      
    if (!emailError && emailCheck?.email === 'admin@smartwash.com') {
      console.log("Special admin user detected, redirecting to admin page");
      navigate('/admin', { replace: true });
      return;
    }
    
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

    const role = profileData?.role as UserRole | null;
    console.log("User role from profile:", role);
    
    // If we reach here, use the role to determine where to redirect
    if (role === 'admin') {
      console.log("Admin role detected, redirecting to admin page");
      navigate('/admin', { replace: true });
      return;
    } else if (role === 'business') {
      console.log("Business role detected, redirecting to owner page");
      
      // Check if user has any laundries before redirecting
      const { data: laundryCheck, error: laundryError } = await supabase
        .from('laundries')
        .select('id')
        .eq('owner_id', userId)
        .limit(1);
      
      if (laundryError) {
        console.error("Error checking laundries:", laundryError);
      }
      
      if (laundryCheck && laundryCheck.length > 0) {
        console.log(`User ${userId} already has laundries:`, laundryCheck);
        navigate('/owner', { replace: true });
        return;
      } else {
        console.log("Business user has no laundries. Creating a test laundry...");
        
        try {
          // Create a test laundry for this business user
          const testLaundryName = `Lavanderia Teste ${Math.floor(Math.random() * 1000)}`;
          const { data: newLaundry, error: createError } = await supabase
            .from('laundries')
            .insert({
              name: testLaundryName,
              address: 'Rua Teste, 123, Cidade Teste',
              contact_email: 'test@example.com',
              contact_phone: '(11) 99999-9999',
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
          }
          
          navigate('/owner', { replace: true });
          return;
        } catch (error) {
          console.error("Error in test laundry creation:", error);
          toast.error("Erro ao criar lavanderia de teste");
        }
      }
      
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

async function updateUserRoleIfNeeded(userId: string, role: UserRole) {
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
