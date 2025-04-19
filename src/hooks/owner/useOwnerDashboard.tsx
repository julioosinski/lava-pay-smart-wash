
import { useLaundries } from "@/hooks/useLaundries";
import { useMachines } from "@/hooks/useMachines";
import { usePayments } from "@/hooks/usePayments";
import { useAuth } from "@/contexts/auth";
import { LaundryLocation, Machine, Payment } from "@/types";
import { useAdminStatus } from "./useAdminStatus";
import { useLocationSelection } from "./useLocationSelection";
import { useOwnerStats } from "./useOwnerStats";

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
  const isAdmin = useAdminStatus(user?.id);
  
  console.log("Owner ID:", user?.id);
  
  // Fetch owner laundries, with forceShowAll only if user is admin
  const { 
    data: ownerLaundries = [], 
    isLoading: isLoadingLaundries,
    error: laundriesError 
  } = useLaundries({ 
    ownerId: !isAdmin ? user?.id : undefined,
    forceShowAll: isAdmin,
    options: {
      enabled: !!user?.id,
      retry: 3,
      staleTime: 30000,
    }
  });

  // Get location selection
  const { selectedLocation, setSelectedLocation } = useLocationSelection(ownerLaundries);
  
  // Get all laundry IDs
  const ownerLaundryIds = ownerLaundries.map(location => location.id);
  console.log("Owner laundry IDs:", ownerLaundryIds);
  
  // Fetch all machines 
  const { 
    data: allMachines = [], 
    isLoading: isLoadingMachines
  } = useMachines();
  
  // Filter machines based on user role
  let ownerMachines = allMachines;
  
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
    isLoading: isLoadingPayments
  } = usePayments();
  
  // Get all machine IDs
  const ownerMachineIds = ownerMachines.map(machine => machine.id);
  const ownerPayments = allPayments.filter(payment => 
    ownerMachineIds.includes(payment.machine_id)
  );

  // Calculate statistics
  const { stats, revenueByDay } = useOwnerStats(ownerMachines, ownerPayments);

  const isLoading = isLoadingLaundries || isLoadingMachines || isLoadingPayments;

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
