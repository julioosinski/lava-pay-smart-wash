
import { RevenueChart } from "@/components/owner/RevenueChart";
import { MachineStatus } from "@/components/owner/MachineStatus";
import { RecentPayments } from "@/components/owner/RecentPayments";
import { OwnerStatsGrid } from "./OwnerStatsGrid";
import { Machine, LaundryLocation, Payment } from "@/types";

interface OwnerDashboardOverviewProps {
  totalRevenue: number;
  ownerLaundries: LaundryLocation[];
  totalMachines: number;
  availableMachines: number;
  maintenanceMachines: number;
  inUsePercentage: number;
  inUseMachines: number;
  revenueByDay: Array<{ day: string; amount: number; }>;
  ownerPayments: Payment[];
  ownerMachines: Machine[];
}

export function OwnerDashboardOverview({
  totalRevenue,
  ownerLaundries,
  totalMachines,
  availableMachines,
  maintenanceMachines,
  inUsePercentage,
  inUseMachines,
  revenueByDay,
  ownerPayments,
  ownerMachines
}: OwnerDashboardOverviewProps) {
  return (
    <div className="space-y-6">
      <OwnerStatsGrid
        totalRevenue={totalRevenue}
        totalLaundries={ownerLaundries.length}
        totalMachines={totalMachines}
        availableMachines={availableMachines}
        maintenanceMachines={maintenanceMachines}
        inUsePercentage={inUsePercentage}
        inUseMachines={inUseMachines}
      />
      
      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart revenueByDay={revenueByDay} />
        <MachineStatus
          availableMachines={availableMachines}
          inUseMachines={inUseMachines}
          maintenanceMachines={maintenanceMachines}
          availablePercentage={(availableMachines / totalMachines) * 100}
          inUsePercentage={inUsePercentage}
          maintenancePercentage={(maintenanceMachines / totalMachines) * 100}
        />
      </div>
      
      <RecentPayments 
        payments={ownerPayments}
        machines={ownerMachines}
        laundries={ownerLaundries}
      />
    </div>
  );
}
