
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WashingMachine, Receipt } from "lucide-react";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { MachinesTab } from "@/components/admin/tabs/MachinesTab";
import { PaymentsTab } from "@/components/admin/tabs/PaymentsTab";
import { useMachines } from "@/hooks/useMachines";
import { usePayments } from "@/hooks/usePayments";
import { useLaundries } from "@/hooks/useLaundries";
import { LaundryLocation } from "@/types";

export default function LaundryDashboard() {
  const { laundryId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Force showing all laundries to find the one with the matching ID
  const { data: laundries = [] as LaundryLocation[] } = useLaundries({ forceShowAll: true });
  const { data: machines = [], isLoading: machinesLoading } = useMachines(laundryId);
  const { data: payments = [], isLoading: paymentsLoading } = usePayments(laundryId);
  
  const laundry = laundries.find(l => l.id === laundryId);

  if (!laundryId || !laundry) {
    return <div>Lavanderia não encontrada</div>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{laundry.name}</h1>
          <p className="text-gray-500">{laundry.address}</p>
        </div>

        <Tabs 
          defaultValue="overview" 
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="machines" className="flex items-center gap-2">
              <WashingMachine className="h-4 w-4" /> Máquinas
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" /> Pagamentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DashboardStats />
          </TabsContent>

          <TabsContent value="machines">
            <MachinesTab
              machines={machines}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab
              payments={payments}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
