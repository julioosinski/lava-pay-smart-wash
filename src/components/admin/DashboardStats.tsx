
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, MapPin, WashingMachine, Users } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

function StatsCard({ title, value, description, icon }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total de Receita"
        value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(12580.50)}
        description="+20.1% em relação ao mês anterior"
        icon={<BarChart className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Lavanderias"
        value={5}
        description="+2 novos locais este mês"
        icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Máquinas"
        value={15}
        description="12 disponíveis"
        icon={<WashingMachine className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Usuários"
        value={150}
        description="5 proprietários"
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
}
