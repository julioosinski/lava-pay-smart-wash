import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MachineCard } from "@/components/MachineCard";
import { ChevronDown, Plus, AlertCircle } from "lucide-react";
import { LaundryForm } from "@/components/admin/LaundryForm";
import { MachineForm } from "@/components/admin/MachineForm";
import { useLaundries } from "@/hooks/useLaundries";
import { useMachines } from "@/hooks/useMachines";
import { usePayments } from "@/hooks/usePayments";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardStats } from "@/components/owner/DashboardStats";
import { RevenueChart } from "@/components/owner/RevenueChart";
import { MachineStatus } from "@/components/owner/MachineStatus";
import { RecentPayments } from "@/components/owner/RecentPayments";

export default function Owner() {
  const { user } = useAuth();
  const { data: laundries = [] } = useLaundries();
  
  // Filter laundries to show only those owned by the current user
  const ownerLaundries = laundries.filter(laundry => laundry.owner_id === user?.id);
  const [selectedLocation, setSelectedLocation] = useState<string>(
    ownerLaundries.length > 0 ? ownerLaundries[0]?.id : "all"
  );
  
  // Get all machines for the selected laundry
  const { data: machines = [] } = useMachines(selectedLocation !== "all" ? selectedLocation : undefined);
  
  // Get payments for selected laundry's machines
  const { data: payments = [] } = usePayments();
  const ownerLaundryIds = ownerLaundries.map(location => location.id);
  const ownerMachines = machines.filter(machine => 
    selectedLocation === "all" 
      ? ownerLaundryIds.includes(machine.laundry_id) 
      : machine.laundry_id === selectedLocation
  );
  
  // Filter payments to only include those for the owner's machines
  const ownerMachineIds = ownerMachines.map(machine => machine.id);
  const ownerPayments = payments.filter(payment => 
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

  const renderMachines = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Gerenciamento de Máquinas</CardTitle>
              <CardDescription>Visualizar e gerenciar suas máquinas</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecionar lavanderia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as lavanderias</SelectItem>
                  {ownerLaundries.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedLocation !== "all" && (
                <MachineForm laundryId={selectedLocation} />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ownerMachines.map(machine => (
              <MachineCard 
                key={machine.id} 
                machine={machine} 
                showActions={false}
              />
            ))}
            
            {ownerMachines.length === 0 && (
              <div className="col-span-full flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {selectedLocation === "all"
                      ? "Nenhuma máquina encontrada. Selecione uma lavanderia específica para adicionar máquinas."
                      : "Nenhuma máquina encontrada para esta lavanderia. Adicione uma nova máquina."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLocations = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <CardTitle>Suas Lavanderias</CardTitle>
            <CardDescription>Gerenciamento de locais</CardDescription>
          </div>
          <LaundryForm />
        </CardHeader>
        <CardContent>
          {ownerLaundries.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Você ainda não possui lavanderias cadastradas.</p>
            </div>
          ) : (
            ownerLaundries.map(location => {
              const locationMachines = machines.filter(m => m.laundry_id === location.id);
              const availableCount = locationMachines.filter(m => m.status === 'available').length;
              const totalCount = locationMachines.length;
              
              return (
                <Card key={location.id} className="mb-4 overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-6">
                      <h3 className="text-lg font-semibold mb-1">{location.name}</h3>
                      <p className="text-gray-500 mb-4">{location.address}</p>
                      
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center">
                          <WashingMachine className="h-4 w-4 mr-2 text-lavapay-600" />
                          <span>{totalCount} máquinas</span>
                        </div>
                        
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          <span>{availableCount} disponíveis</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 flex items-center justify-center md:justify-end">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => setSelectedLocation(location.id)}
                        >
                          Gerenciar
                        </Button>
                        <Button variant="outline" className="text-red-500 hover:text-red-700">Remover</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <CardTitle>Histórico de Pagamentos</CardTitle>
            <CardDescription>Transações financeiras das suas máquinas</CardDescription>
          </div>
          <Button variant="outline" className="mt-4 sm:mt-0">
            <RefreshCcw className="h-4 w-4 mr-2" /> Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Máquina</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>ID Transação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ownerPayments.map((payment) => {
                const machine = ownerMachines.find(m => m.id === payment.machine_id);
                const location = machine ? ownerLaundries.find(l => l.id === machine.laundry_id) : null;
                
                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>
                      {machine ? `${machine.type === 'washer' ? 'Lavadora' : 'Secadora'} #${machine.id}` : "N/A"}
                      {location && <div className="text-xs text-gray-500">{location.name}</div>}
                    </TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell className="capitalize">{payment.method}</TableCell>
                    <TableCell>
                      <StatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell>{formatDate(payment.created_at)}</TableCell>
                    <TableCell>{payment.transaction_id || "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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
            {renderMachines()}
          </TabsContent>

          <TabsContent value="locations">
            {renderLocations()}
          </TabsContent>

          <TabsContent value="payments">
            {renderPayments()}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
