import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLaundries } from "@/hooks/useLaundries";
import { useMachines } from "@/hooks/useMachines";
import { usePayments } from "@/hooks/usePayments";
import { useAuth } from "@/contexts/auth";
import { OwnerDashboardHeader } from "@/components/owner/dashboard/OwnerDashboardHeader";
import { OwnerDashboardOverview } from "@/components/owner/dashboard/OwnerDashboardOverview";
import { MachinesTab } from "@/components/owner/tabs/MachinesTab";
import { LocationsTab } from "@/components/owner/tabs/LocationsTab";
import { PaymentsTab } from "@/components/owner/tabs/PaymentsTab";

export default function Owner() {
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  
  // Fetch laundries owned by the current user
  const { data: ownerLaundries = [], isLoading: isLoadingLaundries } = useLaundries({ 
    ownerId: user?.id,
    options: {
      enabled: !!user?.id,
      retry: 3,
      staleTime: 30000,
    }
  });

  console.log("Owner.tsx - Current user:", user);
  console.log("Owner.tsx - Owner laundries:", ownerLaundries);
  
  // Update selectedLocation when owner laundries change
  useEffect(() => {
    if (ownerLaundries.length > 0 && (selectedLocation === "all" || !selectedLocation)) {
      console.log(`Setting selected location to first laundry: ${ownerLaundries[0]?.id}`);
      setSelectedLocation(ownerLaundries[0]?.id || "all");
    }
  }, [ownerLaundries, selectedLocation]);
  
  // Get laundry IDs owned by the current user
  const ownerLaundryIds = ownerLaundries.map(location => location.id);
  console.log("Owner laundry IDs:", ownerLaundryIds);
  
  // Fetch machines for the owner's laundries
  const { data: allMachines = [], isLoading: isLoadingMachines } = useMachines(selectedLocation !== "all" ? selectedLocation : undefined);
  
  // Filter machines to only show those from owner's laundries
  const ownerMachines = allMachines.filter(machine => 
    ownerLaundryIds.includes(machine.laundry_id)
  );
  
  console.log("Owner machines:", ownerMachines);

  // Get payments for owner's machines
  const { data: allPayments = [], isLoading: isLoadingPayments } = usePayments();
  
  // Filter payments to only include those for the owner's machines
  const ownerMachineIds = ownerMachines.map(machine => machine.id);
  const ownerPayments = allPayments.filter(payment => 
    ownerMachineIds.includes(payment.machine_id)
  );

  console.log("Owner payments:", ownerPayments);

  // Dashboard calculations
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

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-pulse">Carregando dados do proprietário...</div>
        </div>
      </Layout>
    );
  }

  // If no laundries found for this owner, show a message
  if (ownerLaundries.length === 0 && !isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">Painel do Proprietário</h1>
          <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-4">
            <p className="font-bold">Nenhuma lavanderia encontrada</p>
            <p>Você não possui lavanderias cadastradas. Por favor, contate o administrador do sistema.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <OwnerDashboardHeader 
          title="Painel do Proprietário"
          subtitle="Gerencie suas lavanderias e máquinas"
        />

        <Tabs defaultValue="dashboard">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="machines">Máquinas</TabsTrigger>
            <TabsTrigger value="locations">Lavanderias</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <OwnerDashboardOverview
              totalRevenue={totalRevenue}
              ownerLaundries={ownerLaundries}
              totalMachines={totalMachines}
              availableMachines={availableMachines}
              maintenanceMachines={maintenanceMachines}
              inUsePercentage={inUsePercentage}
              inUseMachines={inUseMachines}
              revenueByDay={revenueByDay}
              ownerPayments={ownerPayments}
              ownerMachines={ownerMachines}
            />
          </TabsContent>

          <TabsContent value="machines">
            <MachinesTab 
              machines={ownerMachines}
              ownerLaundries={ownerLaundries}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
            />
          </TabsContent>

          <TabsContent value="locations">
            <LocationsTab 
              ownerLaundries={ownerLaundries}
              machines={ownerMachines}
              onSelectLocation={setSelectedLocation}
            />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab 
              payments={ownerPayments}
              machines={ownerMachines}
              laundries={ownerLaundries}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
