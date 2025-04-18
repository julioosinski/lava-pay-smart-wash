
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OwnerDashboardHeader } from "@/components/owner/dashboard/OwnerDashboardHeader";
import { OwnerDashboardOverview } from "@/components/owner/dashboard/OwnerDashboardOverview";
import { MachinesTab } from "@/components/owner/tabs/MachinesTab";
import { LocationsTab } from "@/components/owner/tabs/LocationsTab";
import { PaymentsTab } from "@/components/owner/tabs/PaymentsTab";
import { useOwnerDashboard } from "@/hooks/useOwnerDashboard";

export default function Owner() {
  const {
    ownerLaundries,
    ownerMachines,
    ownerPayments,
    selectedLocation,
    setSelectedLocation,
    isLoading,
    stats,
    revenueByDay
  } = useOwnerDashboard();

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
              totalRevenue={stats.totalRevenue}
              ownerLaundries={ownerLaundries}
              totalMachines={stats.totalMachines}
              availableMachines={stats.availableMachines}
              maintenanceMachines={stats.maintenanceMachines}
              inUsePercentage={stats.inUsePercentage}
              inUseMachines={stats.inUseMachines}
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
