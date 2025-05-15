import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OwnerDashboardHeader } from "@/components/owner/dashboard/OwnerDashboardHeader";
import { OwnerDashboardOverview } from "@/components/owner/dashboard/OwnerDashboardOverview";
import { MachinesTab } from "@/components/owner/tabs/MachinesTab";
import { LocationsTab } from "@/components/owner/tabs/LocationsTab";
import { PaymentsTab } from "@/components/owner/tabs/PaymentsTab";
import { useOwnerDashboard } from "@/hooks/owner";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LaundryForm } from "@/components/admin/LaundryForm";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export default function Owner() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
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

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Error checking user role:", error);
          return;
        }
        
        setIsAdmin(data?.role === 'admin');
        console.log("User is admin:", data?.role === 'admin');
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    
    checkAdminRole();
  }, [user?.id]);

  const handleRefreshData = async () => {
    if (!user?.id) return;
    
    setIsRefreshing(true);
    try {
      // Invalidate and refetch all relevant queries
      await queryClient.invalidateQueries({ queryKey: ['laundries'] });
      await queryClient.invalidateQueries({ queryKey: ['machines'] });
      await queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Erro ao atualizar os dados");
    } finally {
      setIsRefreshing(false);
    }
  };

  console.log("Owner page - user ID:", user?.id);
  console.log("Owner page - laundries count:", ownerLaundries.length);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-lavapay-600 mx-auto mb-3" />
          <div className="text-lg">Carregando dados...</div>
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
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">
              {isAdmin ? "Painel do Administrador" : "Painel do Proprietário"}
            </h1>
            <Button 
              variant="outline"
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> 
                  Atualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" /> 
                  Atualizar Dados
                </>
              )}
            </Button>
          </div>
          
          <Alert variant="default" className="bg-amber-50 border-amber-200 mb-6">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800">Nenhuma lavanderia encontrada</AlertTitle>
            <AlertDescription className="text-amber-700">
              <p>Você não possui lavanderias cadastradas. Por favor, crie uma nova lavanderia abaixo.</p>
              <p className="text-sm mt-2">ID do usuário: {user?.id}</p>
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-center mt-8">
            <LaundryForm mode="create" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <OwnerDashboardHeader 
            title={isAdmin ? "Painel do Administrador" : "Painel do Proprietário"}
            subtitle={isAdmin ? "Gerencie todas as lavanderias e máquinas" : "Gerencie suas lavanderias e máquinas"}
          />
          
          <Button 
            variant="outline"
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> 
                Atualizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" /> 
                Atualizar Dados
              </>
            )}
          </Button>
        </div>

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
