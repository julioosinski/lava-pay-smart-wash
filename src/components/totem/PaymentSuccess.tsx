
import { useEffect } from 'react';
import { Machine } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { MachineStatusDisplay } from "./MachineStatus";
import { useESP32Monitoring } from '@/hooks/useESP32Monitoring';

interface PaymentSuccessProps {
  machine: Machine;
  onBackToStart: () => void;
}

export function PaymentSuccess({ machine, onBackToStart }: PaymentSuccessProps) {
  const { refreshMachineStatus } = useESP32Monitoring(machine.id);

  useEffect(() => {
    // Atualiza o status da máquina quando o componente é montado
    refreshMachineStatus();
    
    // Configura um timer para atualizar o status periodicamente
    const timer = setInterval(refreshMachineStatus, 10000);
    
    return () => clearInterval(timer);
  }, [refreshMachineStatus]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card className="border-2 border-green-500">
        <CardHeader className="bg-green-50">
          <div className="flex flex-col items-center justify-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <CardTitle className="text-2xl">Pagamento Aprovado!</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <p className="text-center text-lg">
            Sua máquina foi liberada com sucesso!
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Detalhes:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-500">Máquina:</span>
              <span>
                {machine.type === 'washer' ? 'Lavadora' : 'Secadora'} #{machine.machine_number}
              </span>
              <span className="text-gray-500">Tempo:</span>
              <span>{machine.time_minutes} minutos</span>
              <span className="text-gray-500">Valor:</span>
              <span>{formatCurrency(machine.price)}</span>
            </div>
          </div>
          
          <MachineStatusDisplay machineId={machine.id} machineName={`#${machine.machine_number}`} />
          
          <div className="p-4 bg-blue-50 text-blue-700 rounded-lg text-sm">
            <p>Sua máquina já está em funcionamento! Você pode acompanhar o progresso pelo status acima.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={onBackToStart}
            className="w-full bg-lavapay-500 hover:bg-lavapay-600"
          >
            Concluir
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
