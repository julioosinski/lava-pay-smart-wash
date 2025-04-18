
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressCustom } from "@/components/ui/progress-custom";

interface MachineStatusProps {
  availableMachines: number;
  inUseMachines: number;
  maintenanceMachines: number;
  availablePercentage: number;
  inUsePercentage: number;
  maintenancePercentage: number;
}

export function MachineStatus({
  availableMachines,
  inUseMachines,
  maintenanceMachines,
  availablePercentage,
  inUsePercentage,
  maintenancePercentage
}: MachineStatusProps) {
  return (
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
  );
}
