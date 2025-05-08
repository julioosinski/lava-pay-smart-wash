
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, MapPin, WashingMachine, BarChart } from "lucide-react";
import { Machine, Payment, LaundryLocation } from "@/types";

interface DashboardStatsProps {
  totalRevenue: number;
  laundries: LaundryLocation[];
  totalMachines: number;
  availableMachines: number;
  maintenanceMachines: number;
  inUsePercentage: number;
  inUseMachines: number;
}

export function DashboardStats({
  totalRevenue,
  laundries,
  totalMachines,
  availableMachines,
  maintenanceMachines,
  inUsePercentage,
  inUseMachines
}: DashboardStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
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
          <div className="text-2xl font-bold">{laundries.length}</div>
          <p className="text-xs text-muted-foreground">
            {laundries.length} locais em operação
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
  );
}
