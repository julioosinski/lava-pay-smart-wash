
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useLaundries } from "@/hooks/useLaundries";
import { useMachines } from "@/hooks/useMachines";
import { usePayments } from "@/hooks/usePayments";
import { LaundryLocation, Machine, Payment } from "@/types";
import { toast } from "sonner";

export function useOwnerData() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  
  // Check if user is an admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user?.id) return setIsLoading(false);
      
      try {
        // Use RPC to safely check if user is admin
        const { data, error } = await supabase.rpc(
          'get_user_role_safely_no_rls',
          { user_id: user.id }
        );
          
        if (error) {
          console.error("Error checking user role:", error);
          return setIsLoading(false);
        }
        
        setIsAdmin(data === 'admin');
        console.log("User is admin:", data === 'admin');
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminRole();
  }, [user?.id]);

  // Fetch owner laundries, with forceShowAll only if user is admin
  const { 
    data: ownerLaundries = [] as LaundryLocation[], 
    isLoading: isLoadingLaundries,
    error: laundriesError,
    refetch: refetchLaundries
  } = useLaundries({ 
    ownerId: !isAdmin ? user?.id : undefined,
    forceShowAll: isAdmin,
    options: {
      enabled: !!user?.id,
      retry: 3,
      staleTime: 30000,
    }
  });

  // Get all laundry IDs
  const ownerLaundryIds = ownerLaundries.map(location => location.id);
  
  // Fetch all machines 
  const { 
    data: allMachines = [] as Machine[], 
    isLoading: isLoadingMachines,
    error: machinesError
  } = useMachines();
  
  // Filter machines based on user role
  let ownerMachines: Machine[] = allMachines;
  
  // If not admin, only show machines for owner's laundries
  if (!isAdmin && ownerLaundryIds.length > 0) {
    ownerMachines = allMachines.filter(machine => 
      ownerLaundryIds.includes(machine.laundry_id)
    );
  }

  // Get payments for all machines
  const { 
    data: allPayments = [] as Payment[], 
    isLoading: isLoadingPayments,
    error: paymentsError
  } = usePayments();
  
  // Get all machine IDs
  const ownerMachineIds = ownerMachines.map(machine => machine.id);
  const ownerPayments = allPayments.filter(payment => 
    ownerMachineIds.includes(payment.machine_id || '')
  );
  
  // Log errors if any
  useEffect(() => {
    if (laundriesError) {
      console.error("Error fetching owner laundries:", laundriesError);
    }
    if (machinesError) {
      console.error("Error fetching machines:", machinesError);
    }
    if (paymentsError) {
      console.error("Error fetching payments:", paymentsError);
    }
  }, [laundriesError, machinesError, paymentsError]);

  const isLoadingAll = isLoadingLaundries || isLoadingMachines || isLoadingPayments || isLoading;

  return { 
    isAdmin, 
    isLoading: isLoadingAll, 
    ownerLaundries,
    ownerMachines,
    ownerPayments,
    refetchLaundries
  };
}
