
import { useAuth } from "@/contexts/auth";
import { useLaundries } from "@/hooks/useLaundries";
import { useMachines } from "@/hooks/useMachines";
import { usePayments } from "@/hooks/usePayments";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminStatus } from "./useAdminStatus";

export function useOwnerData() {
  const { user } = useAuth();
  const { isAdmin } = useAdminStatus(user?.id);
  
  // Fetch owner laundries, with forceShowAll only if user is admin
  const { 
    data: ownerLaundries = [], 
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

  // Retry fetching laundries if owner_id exists but no laundries were found
  useEffect(() => {
    if (user?.id && !isLoadingLaundries && ownerLaundries.length === 0) {
      const checkDirectLaundries = async () => {
        try {
          const { data, error } = await supabase
            .from('laundries')
            .select('*')
            .eq('owner_id', user.id);
            
          if (error) {
            console.error("Error in direct laundry check:", error);
            return;
          }
          
          if (data && data.length > 0) {
            refetchLaundries();
          }
        } catch (err) {
          console.error("Error checking laundries directly:", err);
        }
      };
      
      checkDirectLaundries();
    }
  }, [user?.id, isLoadingLaundries, ownerLaundries.length, refetchLaundries]);

  useEffect(() => {
    if (laundriesError) {
      console.error("Error fetching owner laundries:", laundriesError);
      toast.error("Erro ao carregar as lavanderias");
    }
  }, [laundriesError]);

  const ownerLaundryIds = ownerLaundries.map(location => location.id);

  // Fetch all machines
  const { 
    data: allMachines = [], 
    isLoading: isLoadingMachines,
    error: machinesError
  } = useMachines();

  let ownerMachines = allMachines;
  if (!isAdmin && ownerLaundryIds.length > 0) {
    ownerMachines = allMachines.filter(machine => 
      ownerLaundryIds.includes(machine.laundry_id)
    );
  }

  useEffect(() => {
    if (machinesError) {
      toast.error("Erro ao carregar as máquinas");
    }
  }, [machinesError]);

  const { 
    data: allPayments = [], 
    isLoading: isLoadingPayments,
    error: paymentsError
  } = usePayments();

  useEffect(() => {
    if (paymentsError) {
      toast.error("Erro ao carregar os pagamentos");
    }
  }, [paymentsError]);

  const ownerMachineIds = ownerMachines.map(machine => machine.id);
  const ownerPayments = allPayments.filter(payment => 
    ownerMachineIds.includes(payment.machine_id || '')
  );

  return {
    ownerLaundries,
    ownerMachines,
    ownerPayments,
    isLoading: isLoadingLaundries || isLoadingMachines || isLoadingPayments,
  };
}
