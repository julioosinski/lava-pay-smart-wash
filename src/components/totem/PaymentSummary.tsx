
import { Machine } from "@/types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

interface PaymentSummaryProps {
  machine: Machine;
}

export function PaymentSummary({ machine }: PaymentSummaryProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle>Resumo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <p>
            {machine.type === 'washer' ? 'Lavadora' : 'Secadora'} #{machine.id}
            <span className="block text-sm text-gray-500">{machine.time_minutes} minutos</span>
          </p>
          <p className="font-semibold text-lg">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(machine.price)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
