
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define a type for the roles to ensure consistent typing
type UserRole = 'admin' | 'business' | 'user';

export async function redirectBasedOnRole(userId: string, navigate: (path: string, options: { replace: boolean }) => void) {
  try {
    console.log("Checking role for user ID:", userId);
    
    // Check if the user has admin role using secure function
    try {
      const { data: isAdmin, error: adminError } = await supabase
        .rpc('is_user_admin_safely', { user_id: userId });

      if (!adminError && isAdmin === true) {
        console.log("Admin role confirmed via secure function, redirecting to admin page");
        navigate('/admin', { replace: true });
        return;
      }
    } catch (adminErr) {
      console.log("Error checking admin status via secure function:", adminErr);
    }
    
    // Try getting the user role directly
    let role: UserRole | null = null;
    
    try {
      const { data: roleData, error: roleError } = await supabase
        .rpc('get_role_directly', { user_id: userId });
        
      if (!roleError && roleData) {
        role = roleData as UserRole;
        console.log("User role from direct query:", role);
      } else {
        console.log("Error getting role via direct query:", roleError);
      }
    } catch (roleErr) {
      console.log("Exception when getting role via direct query:", roleErr);
    }
    
    // If failed to get role via RPC, try getting from user metadata
    if (!role) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.user_metadata?.role) {
          role = user.user_metadata.role as UserRole;
          console.log("User role from metadata:", role);
        }
      } catch (metaErr) {
        console.log("Error getting role from metadata:", metaErr);
      }
    }
    
    // Redirect based on detected role
    if (role === 'admin') {
      console.log("Admin role detected, redirecting to admin page");
      navigate('/admin', { replace: true });
      return;
    } else if (role === 'business') {
      console.log("Business role detected, redirecting to owner page");
      
      // Check if user has any laundries before redirecting - using try/catch to handle any potential errors
      try {
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
      } catch (error) {
        console.error("Error checking laundries:", error);
        // Still redirect to owner page, they can create laundries there
        navigate('/owner', { replace: true });
        return;
      }
    }
    
    // If we couldn't determine role, check if the user has any laundries (business owner)
    try {
      const { data: laundryCheck, error: laundryError } = await supabase
        .from('laundries')
        .select('id')
        .eq('owner_id', userId)
        .limit(1);

      if (laundryError) {
        console.error("Error checking laundries:", laundryError);
      } else if (laundryCheck && laundryCheck.length > 0) {
        console.log(`User ${userId} is a laundry owner, found laundry:`, laundryCheck[0]);
        // Update user role to business if they own a laundry
        await updateUserRoleIfNeeded(userId, 'business');
        console.log("Redirecting to owner dashboard");
        navigate('/owner', { replace: true });
        return;
      } else {
        console.log(`User ${userId} has no laundries associated`);
      }
    } catch (error) {
      console.error("Error checking laundries:", error);
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
    // First check if update is needed using secure function
    const { data: currentRole, error: roleError } = await supabase
      .rpc('get_role_directly', { user_id: userId });

    if (roleError) {
      console.error("Error fetching current role:", roleError);
      return;
    }

    if (currentRole !== role) {
      console.log(`Updating user ${userId} role from ${currentRole} to ${role}`);
      
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
