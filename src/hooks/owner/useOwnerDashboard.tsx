
import { useOwnerData } from './useOwnerData';
import { useOwnerStats } from './useOwnerStats';
import { useRevenueData } from './useRevenueData';
import { useLocationSelection } from './useLocationSelection';
import { LaundryLocation, Machine, Payment } from '@/types';

export interface UseOwnerDashboardReturn {
  ownerLaundries: LaundryLocation[];
  ownerMachines: Machine[];
  ownerPayments: Payment[];
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  isLoading: boolean;
  isAdmin: boolean;
  refetchLaundries: () => void;
  totalRevenue: number;
  totalMachines: number;
  availableMachines: number;
  inUseMachines: number;
  maintenanceMachines: number;
  availablePercentage: number;
  inUsePercentage: number;
  maintenancePercentage: number;
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
  // Get the basic owner data
  const { ownerLaundries, ownerMachines, ownerPayments, isLoading, refetchLaundries, isAdmin } = useOwnerData();
  
  // Calculate stats from the data
  const { stats } = useOwnerStats(ownerMachines, ownerPayments);
  
  // Get revenue chart data
  const { revenueByDay } = useRevenueData(ownerPayments);
  
  // Location selection handling
  const { selectedLocation, setSelectedLocation } = useLocationSelection(ownerLaundries);

  return {
    // Pass through basic data
    ownerLaundries,
    ownerMachines,
    ownerPayments,
    isLoading,
    refetchLaundries,
    isAdmin,
    selectedLocation,
    setSelectedLocation,
    
    // Extract stats properties
    totalRevenue: stats.totalRevenue,
    totalMachines: stats.totalMachines, 
    availableMachines: stats.availableMachines,
    inUseMachines: stats.inUseMachines,
    maintenanceMachines: stats.maintenanceMachines,
    availablePercentage: stats.availablePercentage,
    inUsePercentage: stats.inUsePercentage,
    maintenancePercentage: stats.maintenancePercentage,
    
    // Also include complete stats object and chart data
    stats,
    revenueByDay
  };
}
