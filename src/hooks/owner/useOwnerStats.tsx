
import { Machine, Payment, LaundryLocation } from "@/types";

interface OwnerStats {
  totalRevenue: number;
  totalMachines: number;
  availableMachines: number;
  inUseMachines: number;
  maintenanceMachines: number;
  availablePercentage: number;
  inUsePercentage: number;
  maintenancePercentage: number;
}

export function useOwnerStats(ownerMachines: Machine[], ownerPayments: Payment[]) {
  const totalMachines = ownerMachines.length;
  const availableMachines = ownerMachines.filter(m => m.status === 'available').length;
  const inUseMachines = ownerMachines.filter(m => m.status === 'in-use').length;
  const maintenanceMachines = ownerMachines.filter(m => m.status === 'maintenance').length;
  
  const availablePercentage = totalMachines > 0 ? (availableMachines / totalMachines) * 100 : 0;
  const inUsePercentage = totalMachines > 0 ? (inUseMachines / totalMachines) * 100 : 0;
  const maintenancePercentage = totalMachines > 0 ? (maintenanceMachines / totalMachines) * 100 : 0;

  const totalRevenue = ownerPayments
    .filter(payment => payment.status === 'approved')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return {
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
  };
}
