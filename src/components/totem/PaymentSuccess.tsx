
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Machine } from "@/types";

interface PaymentSuccessProps {
  machine: Machine | null;
  onBackToStart: () => void;
}

export function PaymentSuccess({ machine, onBackToStart }: PaymentSuccessProps) {
  return (
    <div className="container mx-auto px-4 py-16 max-w-md text-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Pagamento Confirmado!</CardTitle>
        </CardHeader>
        <CardContent className="py-8 flex flex-col items-center">
          <div className="rounded-full bg-green-100 p-4 mb-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <p className="text-lg mb-2">Sua máquina foi liberada com sucesso!</p>
          <p className="text-gray-500 mb-6">Você já pode utilizar o equipamento.</p>
          
          {machine && (
            <div className="border border-gray-200 rounded-md p-4 bg-gray-50 mb-6 w-full">
              <p className="font-medium mb-1">Detalhes:</p>
              <p className="text-gray-600">
                {machine.type === 'washer' ? 'Lavadora' : 'Secadora'} #{machine.id} - {machine.time_minutes} minutos
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg

-lavapay-500 hover:bg-lavapay-600" 
            onClick={onBackToStart}
          >
            Voltar ao Início
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
