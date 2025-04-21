
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { Machine } from "@/types";
import { WashingMachine, Loader, Timer, Hash, Barcode, Wifi, WifiOff } from "lucide-react";
import { MachineForm } from "./admin/machines/MachineForm";
import { useSessionTimer } from "@/hooks/useSessionTimer";

interface MachineCardProps {
  machine: Machine;
  onSelect?: () => void;
  showActions?: boolean;
  showEdit?: boolean;
}

export function MachineCard({ machine, onSelect, showActions = true, showEdit = false }: MachineCardProps) {
  const { timeRemaining, isActive, formattedTime } = useSessionTimer(machine);
  
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(machine.price);

  const displayId = machine.machine_number || machine.id.substring(0, 4);
  
  // Check if we have ESP32 connection information
  const esp32Connected = (machine as any).esp32_connected;
  const hasEsp32Status = esp32Connected !== undefined;

  return (
    <Card className="border border-slate-200 overflow-hidden">
      <CardHeader className="bg-lavapay-50 pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <WashingMachine className="h-5 w-5 text-lavapay-600" />
            {machine.type === 'washer' ? 'Lavadora' : 'Secadora'} #{displayId}
          </span>
          <div className="flex items-center gap-2">
            {showEdit && (
              <MachineForm
                laundryId={machine.laundry_id}
                machine={machine}
                variant="edit"
              />
            )}
            <StatusBadge status={machine.status} />
            {hasEsp32Status && (
              <span className="ml-2" title={esp32Connected ? "ESP32 conectado" : "ESP32 desconectado"}>
                {esp32Connected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
              </span>
            )}
          </div>
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
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Hash className="h-4 w-4" /> ID Loja
            </span>
            <span className="font-medium">{machine.store_id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Barcode className="h-4 w-4" /> Serial
            </span>
            <span className="font-medium">{machine.machine_serial}</span>
          </div>
          {isActive && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Timer className="h-4 w-4" /> Tempo Restante
              </span>
              <span className="font-medium text-lavapay-600">{formattedTime}</span>
            </div>
          )}
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="pt-2 pb-4">
          <Button 
            className="w-full bg-lavapay-500 hover:bg-lavapay-600" 
            disabled={machine.status !== 'available' || esp32Connected === false}
            onClick={onSelect}
          >
            {machine.status === 'available' ? (
              esp32Connected === false ? 'Máquina Offline' : 'Selecionar'
            ) : 
             machine.status === 'in-use' ? `Em uso ${formattedTime ? `(${formattedTime})` : ''}` : 
             'Indisponível'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
