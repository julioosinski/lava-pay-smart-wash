
import { useState, useEffect } from "react";
import { useLaundries } from "@/hooks/useLaundries";
import { useMachines } from "@/hooks/useMachines";
import { usePayments } from "@/hooks/usePayments";
import { useAuth } from "@/contexts/auth";
import { LaundryLocation, Machine, Payment } from "@/types";
import { toast } from "sonner";

interface UseOwnerDashboardReturn {
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
  
  console.log("Owner ID:", user?.id);
  
  // Fetch owner laundries with forceShowAll: false to only get laundries owned by current user
  const { 
    data: ownerLaundries = [], 
    isLoading: isLoadingLaundries,
    error: laundriesError
  } = useLaundries({ 
    ownerId: user?.id,
    options: {
      enabled: !!user?.id,
      retry: 3,
      staleTime: 30000,
    }
  });
  
  useEffect(() => {
    if (laundriesError) {
      console.error("Error fetching owner laundries:", laundriesError);
      toast.error("Erro ao carregar as lavanderias do proprietário");
    }
  }, [laundriesError]);

  console.log("Owner laundries fetched:", ownerLaundries);

  // Update selectedLocation when owner laundries change
  useEffect(() => {
    if (ownerLaundries.length > 0 && (selectedLocation === "all" || !selectedLocation)) {
      setSelectedLocation(ownerLaundries[0]?.id || "all");
      console.log("Setting selected location to:", ownerLaundries[0]?.id || "all");
    }
  }, [ownerLaundries, selectedLocation]);
  
  // Get laundry IDs owned by the current user
  const ownerLaundryIds = ownerLaundries.map(location => location.id);
  console.log("Owner laundry IDs:", ownerLaundryIds);
  
  // First, fetch all machines (we'll filter them later)
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
  
  // Now explicitly filter machines to only include those belonging to this owner's laundries
  const ownerMachines = ownerLaundryIds.length > 0 
    ? allMachines.filter(machine => ownerLaundryIds.includes(machine.laundry_id))
    : [];

  console.log("All machines:", allMachines);
  console.log("Owner machines filtered:", ownerMachines);

  // Get payments for owner's machines
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
  
  // Filter payments to only include those for the owner's machines
  const ownerMachineIds = ownerMachines.map(machine => machine.id);
  const ownerPayments = allPayments.filter(payment => 
    ownerMachineIds.includes(payment.machine_id)
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

  // Revenue chart data (simulated)
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

  return {
    ownerLaundries,
    ownerMachines,
    selectedLocation,
    setSelectedLocation,
    isLoading,
    ownerPayments,
    stats: {
      totalRevenue,
      totalMachines,
      availableMachines,
      inUseMachines,
      maintenanceMachines,
      availablePercentage,
      inUsePercentage,
      maintenancePercentage,
    },
    revenueByDay
  };
}
