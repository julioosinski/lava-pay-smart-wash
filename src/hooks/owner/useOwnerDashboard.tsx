
import { useOwnerData } from './useOwnerData';
import { useOwnerStats } from './useOwnerStats';
import { useRevenueData } from './useRevenueData';
import { useLocationSelection } from './useLocationSelection';

export function useOwnerDashboard() {
  const { ownerLaundries, ownerMachines, ownerPayments, isLoading, isAdmin } = useOwnerData();
  const { stats } = useOwnerStats(ownerMachines, ownerPayments);
  const { revenueByDay } = useRevenueData(ownerPayments);
  const { selectedLocation, setSelectedLocation } = useLocationSelection(ownerLaundries);

  return {
    ownerLaundries,
    ownerMachines,
    ownerPayments,
    selectedLocation,
    setSelectedLocation,
    isLoading,
    stats,
    revenueByDay,
    isAdmin
  };
}
