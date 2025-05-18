
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, CreditCard, WashingMachine } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Skeleton } from "@/components/ui/skeleton";

import { LocationsTab } from "@/components/owner/tabs/LocationsTab";
import { MachinesTab } from "@/components/owner/tabs/MachinesTab";
import { PaymentsTab } from "@/components/owner/tabs/PaymentsTab";
import { OwnerDashboardHeader } from "@/components/owner/dashboard/OwnerDashboardHeader";
import { OwnerDashboardOverview } from "@/components/owner/dashboard/OwnerDashboardOverview";

import { useOwnerDashboard } from "@/hooks/owner/useOwnerDashboard";

export default function Owner() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user } = useAuth();
  
  // Owner dashboard data
  const {
    isLoading,
    isAdmin,
    ownerLaundries,
    ownerMachines,
    ownerPayments,
    refetchLaundries,
    revenueByDay,
    totalRevenue,
    availableMachines,
    inUseMachines,
    maintenanceMachines,
    inUsePercentage,
    selectedLocation,
    setSelectedLocation
  } = useOwnerDashboard();
  
  const totalMachines = ownerMachines.length;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <OwnerDashboardHeader 
          title="Dashboard do Proprietário" 
          subtitle="Gerencie suas lavanderias e máquinas"
          isAdmin={isAdmin}
        />

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="locations" className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> Lavanderias
              </TabsTrigger>
              <TabsTrigger value="machines" className="flex items-center gap-1">
                <WashingMachine className="h-4 w-4" /> Máquinas
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" /> Pagamentos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              {isLoading ? (
                <div className="space-y-4">
                  <Card className="p-6">
                    <Skeleton className="h-[300px] w-full" />
                  </Card>
                </div>
              ) : (
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
              )}
            </TabsContent>

            <TabsContent value="locations">
              <LocationsTab 
                laundries={ownerLaundries} 
                machines={ownerMachines}
                isLoading={isLoading} 
                refetchLaundries={refetchLaundries}
                isAdmin={isAdmin}
                onSelectLocation={setSelectedLocation}
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

            <TabsContent value="payments">
              <PaymentsTab 
                payments={ownerPayments} 
                machines={ownerMachines}
                laundries={ownerLaundries}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
