
import { useState, useEffect } from "react";
import { useLaundries } from "@/hooks/useLaundries";
import { useMachines } from "@/hooks/useMachines";
import { usePayments } from "@/hooks/usePayments";
import { useAuth } from "@/contexts/auth";
import { LaundryLocation, Machine, Payment } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface UseOwnerDashboardReturn {
  ownerLaundries: LaundryLocation[];
  ownerMachines: Machine[];
  ownerPayments: Payment[];
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  isLoading: boolean;
  stats: {
    totalRevenue: number;
    totalMachines: number;
    availableMachines: number;
    inUseMachines: number;
    maintenanceMachines: number;
    availablePercentage: number;
    inUsePercentage: number;
    maintenancePercentage: number;
  };
  revenueByDay: Array<{ day: string; amount: number; }>;
}

export function useOwnerDashboard(): UseOwnerDashboardReturn {
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  console.log("Owner ID:", user?.id);
  
  // Check if user is an admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Error checking user role:", error);
          return;
        }
        
        setIsAdmin(data?.role === 'admin');
        console.log("User is admin:", data?.role === 'admin');
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    
    checkAdminRole();
  }, [user?.id]);
  
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
      // Check directly in Supabase if there are laundries for this owner
      const checkDirectLaundries = async () => {
        console.log("Direct check for laundries with owner_id:", user.id);
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
            console.log("Found laundries directly:", data);
            // If laundries exist but weren't returned by the hook, refetch
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

  console.log("Owner laundries fetched:", ownerLaundries);

  // Update selectedLocation when laundries change
  useEffect(() => {
    if (ownerLaundries.length > 0 && (selectedLocation === "all" || !selectedLocation)) {
      setSelectedLocation(ownerLaundries[0]?.id || "all");
      console.log("Setting selected location to:", ownerLaundries[0]?.id || "all");
    }
  }, [ownerLaundries, selectedLocation]);
  
  // Get all laundry IDs
  const ownerLaundryIds = ownerLaundries.map(location => location.id);
  console.log("Owner laundry IDs:", ownerLaundryIds);
  
  // Fetch all machines 
  const { 
    data: allMachines = [], 
    isLoading: isLoadingMachines,
    error: machinesError
  } = useMachines();
  
  useEffect(() => {
    if (machinesError) {
      console.error("Error fetching machines:", machinesError);
      toast.error("Erro ao carregar as máquinas");
    }
  }, [machinesError]);
  
  // Filter machines based on user role
  let ownerMachines: Machine[] = allMachines;
  
  // If not admin, only show machines for owner's laundries
  if (!isAdmin && ownerLaundryIds.length > 0) {
    ownerMachines = allMachines.filter(machine => 
      ownerLaundryIds.includes(machine.laundry_id)
    );
  }
  
  console.log("Owner machines filtered:", ownerMachines);

  // Get payments for all machines
  const { 
    data: allPayments = [], 
    isLoading: isLoadingPayments,
    error: paymentsError
  } = usePayments();
  
  useEffect(() => {
    if (paymentsError) {
      console.error("Error fetching payments:", paymentsError);
      toast.error("Erro ao carregar os pagamentos");
    }
  }, [paymentsError]);
  
  // Get all machine IDs
  const ownerMachineIds = ownerMachines.map(machine => machine.id);
  const ownerPayments = allPayments.filter(payment => 
    ownerMachineIds.includes(payment.machine_id || '')
  );

  console.log("Owner payments filtered:", ownerPayments);

  // Calculate dashboard statistics
  const totalRevenue = ownerPayments
    .filter(payment => payment.status === 'approved')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const totalMachines = ownerMachines.length;
  const availableMachines = ownerMachines.filter(m => m.status === 'available').length;
  const inUseMachines = ownerMachines.filter(m => m.status === 'in-use').length;
  const maintenanceMachines = ownerMachines.filter(m => m.status === 'maintenance').length;
  
  const availablePercentage = totalMachines > 0 ? (availableMachines / totalMachines) * 100 : 0;
  const inUsePercentage = totalMachines > 0 ? (inUseMachines / totalMachines) * 100 : 0;
  const maintenancePercentage = totalMachines > 0 ? (maintenanceMachines / totalMachines) * 100 : 0;

  // Revenue chart data
  const revenueByDay = [
    { day: 'Seg', amount: 320 },
    { day: 'Ter', amount: 280 },
    { day: 'Qua', amount: 340 },
    { day: 'Qui', amount: 380 },
    { day: 'Sex', amount: 450 },
    { day: 'Sáb', amount: 520 },
    { day: 'Dom', amount: 390 },
  ];

  const isLoading = isLoadingLaundries || isLoadingMachines || isLoadingPayments;

  const stats = {
    totalRevenue,
    totalMachines,
    availableMachines,
    inUseMachines,
    maintenanceMachines,
    availablePercentage,
    inUsePercentage,
    maintenancePercentage,
  };

  return {
    ownerLaundries,
    ownerMachines,
    ownerPayments,
    selectedLocation,
    setSelectedLocation,
    isLoading,
    stats,
    revenueByDay
  };
}
