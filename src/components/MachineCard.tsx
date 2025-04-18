
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { Machine } from "@/types";
import { WashingMachine, Loader, Timer } from "lucide-react";

interface MachineCardProps {
  machine: Machine;
  onSelect?: () => void;
  showActions?: boolean;
}

export function MachineCard({ machine, onSelect, showActions = true }: MachineCardProps) {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(machine.price);

  const displayId = machine.machine_number || machine.id.substring(0, 4);

  return (
    <Card className="border border-slate-200 overflow-hidden">
      <CardHeader className="bg-lavapay-50 pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <WashingMachine className="h-5 w-5 text-lavapay-600" />
            {machine.type === 'washer' ? 'Lavadora' : 'Secadora'} #{displayId}
          </span>
          <StatusBadge status={machine.status} />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Timer className="h-4 w-4" /> Duração
            </span>
            <span className="font-medium">{machine.time_minutes} minutos</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Loader className="h-4 w-4" /> Preço
            </span>
            <span className="font-medium text-lavapay-700">{formattedPrice}</span>
          </div>
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="pt-2 pb-4">
          <Button 
            className="w-full bg-lavapay-500 hover:bg-lavapay-600" 
            disabled={machine.status !== 'available'}
            onClick={onSelect}
          >
            {machine.status === 'available' ? 'Selecionar' : 'Indisponível'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
