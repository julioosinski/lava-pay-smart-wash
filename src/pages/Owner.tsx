import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MachineCard } from "@/components/MachineCard";
import { mockLocations, mockMachines, mockPayments, mockUsers } from "@/lib/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { 
  BarChart, 
  DollarSign, 
  MapPin, 
  WashingMachine, 
  RefreshCcw, 
  PlusCircle,
  ChevronDown,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProgressCustom } from "@/components/ui/progress-custom";

// Filtrar para mostrar apenas dados do proprietário atual (ID 2)
const currentOwnerId = '2';
const ownerLocations = mockLocations.filter(location => location.ownerId === currentOwnerId);
const ownerLocationIds = ownerLocations.map(location => location.id);
const ownerMachines = mockMachines.filter(machine => ownerLocationIds.includes(machine.locationId));
const ownerMachineIds = ownerMachines.map(machine => machine.id);
const ownerPayments = mockPayments.filter(payment => ownerMachineIds.includes(payment.machineId));

export default function Owner() {
  const [selectedLocation, setSelectedLocation] = useState<string>(ownerLocations[0]?.id || "all");

  const filteredMachines = ownerMachines.filter(
    machine => selectedLocation === "all" ? true : machine.locationId === selectedLocation
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Cálculos para o dashboard
  const totalRevenue = ownerPayments
    .filter(payment => payment.status === 'approved')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const totalMachines = ownerMachines.length;
  const availableMachines = ownerMachines.filter(m => m.status === 'available').length;
  const inUseMachines = ownerMachines.filter(m => m.status === 'in-use').length;
  const maintenanceMachines = ownerMachines.filter(m => m.status === 'maintenance').length;
  
  const availablePercentage = (availableMachines / totalMachines) * 100;
  const inUsePercentage = (inUseMachines / totalMachines) * 100;
  const maintenancePercentage = (maintenanceMachines / totalMachines) * 100;

  // Cálculo do gráfico de receita (simulado)
  const revenueByDay = [
    { day: 'Seg', amount: 320 },
    { day: 'Ter', amount: 280 },
    { day: 'Qua', amount: 340 },
    { day: 'Qui', amount: 380 },
    { day: 'Sex', amount: 450 },
    { day: 'Sáb', amount: 520 },
    { day: 'Dom', amount: 390 },
  ];

  const maxRevenue = Math.max(...revenueByDay.map(d => d.amount));

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +15.2% em relação à semana passada
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lavanderias</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ownerLocations.length}</div>
            <p className="text-xs text-muted-foreground">
              {ownerLocations.length} locais em operação
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Máquinas</CardTitle>
            <WashingMachine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMachines}</div>
            <p className="text-xs text-muted-foreground">
              {availableMachines} disponíveis, {maintenanceMachines} em manutenção
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(inUsePercentage)}%</div>
            <p className="text-xs text-muted-foreground">
              {inUseMachines} máquinas em uso no momento
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receita Semanal</CardTitle>
            <CardDescription>Receita dos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end justify-between gap-2">
              {revenueByDay.map((data) => (
                <div key={data.day} className="flex flex-col items-center">
                  <div 
                    className="bg-lavapay-500 w-8 rounded-t-md" 
                    style={{ height: `${(data.amount / maxRevenue) * 160}px` }}
                  ></div>
                  <div className="text-xs mt-2">{data.day}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Status das Máquinas</CardTitle>
            <CardDescription>Visão geral do estado do equipamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Disponíveis</span>
                </div>
                <span>{availableMachines} máquinas</span>
              </div>
              <ProgressCustom value={availablePercentage} bgColor="bg-green-500" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                  <span>Em Uso</span>
                </div>
                <span>{inUseMachines} máquinas</span>
              </div>
              <ProgressCustom value={inUsePercentage} bgColor="bg-blue-500" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-orange-500 mr-2"></div>
                  <span>Manutenção</span>
                </div>
                <span>{maintenanceMachines} máquinas</span>
              </div>
              <ProgressCustom value={maintenancePercentage} bgColor="bg-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Pagamentos Recentes</CardTitle>
          <CardDescription>Últimas transações registradas no sistema</CardDescription>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {ownerPayments.slice(0, 5).map((payment) => {
                const machine = ownerMachines.find(m => m.id === payment.machineId);
                const location = machine ? ownerLocations.find(l => l.id === machine.locationId) : null;
                
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
                    <TableCell>{formatDate(payment.createdAt)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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
                  {ownerLocations.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button className="bg-lavapay-500 hover:bg-lavapay-600">
                <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Máquina
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMachines.map(machine => (
              <MachineCard 
                key={machine.id} 
                machine={machine} 
                showActions={false}
              />
            ))}
            
            {filteredMachines.length === 0 && (
              <div className="col-span-full flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhuma máquina encontrada para esta lavanderia.</p>
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
          <Button className="bg-lavapay-500 hover:bg-lavapay-600 mt-4 sm:mt-0">
            <PlusCircle className="h-4 w-4 mr-2" /> Nova Lavanderia
          </Button>
        </CardHeader>
        <CardContent>
          {ownerLocations.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Você ainda não possui lavanderias cadastradas.</p>
            </div>
          ) : (
            ownerLocations.map(location => {
              const locationMachines = ownerMachines.filter(m => m.locationId === location.id);
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
                        <Button variant="outline">Gerenciar</Button>
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
                const machine = ownerMachines.find(m => m.id === payment.machineId);
                const location = machine ? ownerLocations.find(l => l.id === machine.locationId) : null;
                
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
                    <TableCell>{formatDate(payment.createdAt)}</TableCell>
                    <TableCell>{payment.transactionId || "—"}</TableCell>
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
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="machines" className="flex items-center gap-2">
              <WashingMachine className="h-4 w-4" /> Máquinas
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Lavanderias
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Pagamentos
            </TabsTrigger>
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
