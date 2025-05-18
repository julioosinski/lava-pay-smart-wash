
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, CreditCard, WashingMachine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Skeleton } from "@/components/ui/skeleton";

import { LocationsTab } from "@/components/owner/tabs/LocationsTab";
import { MachinesTab } from "@/components/owner/tabs/MachinesTab";
import { PaymentsTab } from "@/components/owner/tabs/PaymentsTab";
import { OwnerDashboardHeader } from "@/components/owner/dashboard/OwnerDashboardHeader";
import { OwnerDashboardOverview } from "@/components/owner/dashboard/OwnerDashboardOverview";

import { useOwnerDashboard } from "@/hooks/useOwnerDashboard";
import { useLocationSelection } from "@/hooks/owner/useLocationSelection";

export default function Owner() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  
  // Check if user is an admin to enable special features
  useEffect(() => {
    const checkIsAdmin = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase.rpc(
          'is_admin_safely_no_rls',
          { user_id: user.id }
        );
          
        if (error) {
          console.error("Error checking user role:", error);
          return;
        }
        
        setIsAdmin(data === true);
        console.log("User is admin:", data === true);
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    
    checkIsAdmin();
  }, [user]);

  // Owner dashboard data
  const {
    isLoading,
    ownerLaundries,
    ownerMachines,
    ownerPayments,
    refetchLaundries,
    revenueByDay,
    totalRevenue,
    availableMachines,
    inUseMachines,
    maintenanceMachines,
    inUsePercentage
  } = useOwnerDashboard();

  // Location selection for machine filtering
  const { selectedLocation, setSelectedLocation } = useLocationSelection(ownerLaundries);
  
  const totalMachines = ownerMachines.length;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <OwnerDashboardHeader isAdmin={isAdmin} />

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
                isLoading={isLoading} 
                refetchLaundries={refetchLaundries}
                isAdmin={isAdmin}
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
