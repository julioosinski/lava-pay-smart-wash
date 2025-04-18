
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useLaundries } from "@/hooks/useLaundries";
import { useMachines } from "@/hooks/useMachines";
import { usePayments } from "@/hooks/usePayments";
import { useAuth } from "@/contexts/auth";
import { DashboardStats } from "@/components/owner/DashboardStats";
import { RevenueChart } from "@/components/owner/RevenueChart";
import { MachineStatus } from "@/components/owner/MachineStatus";
import { RecentPayments } from "@/components/owner/RecentPayments";
import { MachinesTab } from "@/components/owner/tabs/MachinesTab";
import { LocationsTab } from "@/components/owner/tabs/LocationsTab";
import { PaymentsTab } from "@/components/owner/tabs/PaymentsTab";
import { supabase } from "@/integrations/supabase/client";

export default function Owner() {
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  
  // Fetch laundries that belong to the current user
  const { data: ownerLaundries = [], isLoading } = useLaundries({ 
    ownerId: user?.id,
    options: {
      enabled: !!user?.id
    }
  });

  console.log(`Owner laundries for user ${user?.id}:`, ownerLaundries);
  
  // Update selectedLocation when owner laundries change
  useEffect(() => {
    if (ownerLaundries.length > 0 && selectedLocation === "all") {
      setSelectedLocation(ownerLaundries[0]?.id || "all");
    }
  }, [ownerLaundries]);
  
  // Get laundry IDs owned by the current user
  const ownerLaundryIds = ownerLaundries.map(location => location.id);
  console.log("Owner laundry IDs:", ownerLaundryIds);
  
  // Fetch all machines for all laundries owned by the current user
  const { data: allMachines = [] } = useMachines(selectedLocation !== "all" ? selectedLocation : undefined);
  
  // Filter machines to only show those from owner's laundries
  const ownerMachines = allMachines.filter(machine => {
    const belongs = ownerLaundryIds.includes(machine.laundry_id);
    if (belongs) {
      console.log(`Machine ${machine.id} belongs to owner's laundry ${machine.laundry_id}`);
    }
    return belongs;
  });
  
  console.log("Owner machines after filtering:", ownerMachines);

  // Get payments for selected laundry's machines
  const { data: allPayments = [] } = usePayments();
  
  // Filter payments to only include those for the owner's machines
  const ownerMachineIds = ownerMachines.map(machine => machine.id);
  const ownerPayments = allPayments.filter(payment => 
    ownerMachineIds.includes(payment.machine_id)
  );

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

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-pulse">Carregando dados do proprietário...</div>
        </div>
      </Layout>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <DashboardStats
        totalRevenue={totalRevenue}
        laundries={ownerLaundries}
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
          availablePercentage={availablePercentage}
          inUsePercentage={inUsePercentage}
          maintenancePercentage={maintenancePercentage}
        />
      </div>
      
      <RecentPayments 
        payments={ownerPayments}
        machines={ownerMachines}
        laundries={ownerLaundries}
      />
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Painel do Proprietário</h1>
            <Button variant="outline" className="h-9">
              <ChevronDown className="h-4 w-4 mr-2" />
              Suas Lavanderias
            </Button>
          </div>
          <p className="text-gray-500">Gerencie suas lavanderias e máquinas</p>
        </div>

        <Tabs defaultValue="dashboard">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="machines">Máquinas</TabsTrigger>
            <TabsTrigger value="locations">Lavanderias</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {renderDashboard()}
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
