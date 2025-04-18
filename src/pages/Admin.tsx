
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, MapPin, WashingMachine, Users, Receipt } from "lucide-react";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { LaundryTab } from "@/components/admin/tabs/LaundryTab";
import { MachinesTab } from "@/components/admin/tabs/MachinesTab";
import { PaymentsTab } from "@/components/admin/tabs/PaymentsTab";
import { UsersTab } from "@/components/admin/tabs/UsersTab";
import { useMachines } from "@/hooks/useMachines";
import { mockPayments, mockUsers } from "@/lib/mockData";
import { usePayments } from "@/hooks/usePayments";

export default function Admin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const { data: machines = [], isLoading: machinesLoading } = useMachines();
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel de Administração</h1>
          <p className="text-gray-500">Gerencie lavanderias, máquinas e usuários do sistema</p>
        </div>

        <Tabs 
          defaultValue="dashboard" 
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Lavanderias
            </TabsTrigger>
            <TabsTrigger value="machines" className="flex items-center gap-2">
              <WashingMachine className="h-4 w-4" /> Máquinas
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" /> Pagamentos
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Usuários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardStats />
          </TabsContent>

          <TabsContent value="locations">
            <LaundryTab
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
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
              payments={paymentsLoading ? [] : payments}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab
              users={mockUsers}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
