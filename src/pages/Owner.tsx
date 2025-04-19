
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OwnerDashboardHeader } from "@/components/owner/dashboard/OwnerDashboardHeader";
import { OwnerDashboardOverview } from "@/components/owner/dashboard/OwnerDashboardOverview";
import { MachinesTab } from "@/components/owner/tabs/MachinesTab";
import { LocationsTab } from "@/components/owner/tabs/LocationsTab";
import { PaymentsTab } from "@/components/owner/tabs/PaymentsTab";
import { useOwnerDashboard } from "@/hooks/useOwnerDashboard";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth";

export default function Owner() {
  const { user } = useAuth();
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

  console.log("Owner page - user ID:", user?.id);
  console.log("Owner page - laundries count:", ownerLaundries.length);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-lavapay-600 mx-auto mb-3" />
          <div className="text-lg">Carregando dados do administrador...</div>
          <div className="text-sm text-gray-500 mt-2">Verificando lavanderias e máquinas associadas...</div>
        </div>
      </Layout>
    );
  }

  // If no laundries found for this owner, show a message
  if (ownerLaundries.length === 0 && !isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">Painel do Administrador</h1>
          
          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800">Nenhuma lavanderia encontrada</AlertTitle>
            <AlertDescription className="text-amber-700">
              <p>Você não possui lavanderias cadastradas. Por favor, contate o administrador do sistema.</p>
              <p className="text-sm mt-2">ID do usuário: {user?.id}</p>
            </AlertDescription>
          </Alert>
          
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <OwnerDashboardHeader 
          title="Painel do Administrador"
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
