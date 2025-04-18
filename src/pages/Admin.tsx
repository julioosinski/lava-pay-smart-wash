
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, MapPin, WashingMachine, Users, Receipt } from "lucide-react";
import { mockUsers, mockLocations, mockMachines, mockPayments } from "@/lib/mockData";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { LaundryTab } from "@/components/admin/tabs/LaundryTab";
import { MachinesTab } from "@/components/admin/tabs/MachinesTab";
import { PaymentsTab } from "@/components/admin/tabs/PaymentsTab";
import { UsersTab } from "@/components/admin/tabs/UsersTab";

export default function Admin() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLocations = mockLocations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredMachines = mockMachines.filter(machine =>
    machine.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.status.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredPayments = mockPayments.filter(payment =>
    payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.machineId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel de Administração</h1>
          <p className="text-gray-500">Gerencie lavanderias, máquinas e usuários do sistema</p>
        </div>

        <Tabs defaultValue="dashboard">
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
              laundries={filteredLocations}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </TabsContent>

          <TabsContent value="machines">
            <MachinesTab
              machines={filteredMachines}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab
              payments={filteredPayments}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab
              users={filteredUsers}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
