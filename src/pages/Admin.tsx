
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, WashingMachine, Users, CreditCard } from "lucide-react";
import { LaundryTab } from "@/components/admin/tabs/LaundryTab";
import { SubscriptionsTab } from "@/components/admin/tabs/SubscriptionsTab";
import { MachinesTab } from "@/components/admin/tabs/MachinesTab";
import { UsersTab } from "@/components/admin/tabs/UsersTab";
import { PaymentSettingsTab } from "@/components/admin/payment-settings/PaymentSettingsTab";
import { useMachines } from "@/hooks/useMachines";
import { useLaundries } from "@/hooks/useLaundries";
import { LaundryLocation } from "@/types";

export default function Admin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  
  // Force showing all laundries for admin
  const { data: allLaundries = [] as LaundryLocation[] } = useLaundries({ forceShowAll: true });
  const { data: machines = [] } = useMachines();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel de Administração</h1>
          <p className="text-gray-500">Gerencie proprietários, lavanderias e mensalidades do sistema</p>
        </div>

        <Tabs 
          defaultValue="users" 
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-6">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Proprietários
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Lavanderias
            </TabsTrigger>
            <TabsTrigger value="machines" className="flex items-center gap-2">
              <WashingMachine className="h-4 w-4" /> Máquinas
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Mensalidades
            </TabsTrigger>
            <TabsTrigger value="payment-settings" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Pagamentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersTab
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </TabsContent>

          <TabsContent value="locations">
            <LaundryTab
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              laundries={allLaundries}
            />
          </TabsContent>

          <TabsContent value="machines">
            <MachinesTab
              machines={machines}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </TabsContent>

          <TabsContent value="subscriptions">
            <SubscriptionsTab
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </TabsContent>

          <TabsContent value="payment-settings">
            <PaymentSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
