
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface PaymentErrorProps {
  onRetry: () => void;
  onBackToStart: () => void;
}

export function PaymentError({ onRetry, onBackToStart }: PaymentErrorProps) {
  return (
    <div className="container mx-auto px-4 py-16 max-w-md text-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Erro no Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="py-8 flex flex-col items-center">
          <div className="rounded-full bg-red-100 p-4 mb-6">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
          <p className="text-lg mb-2">Ocorreu um erro ao processar seu pagamento</p>
          <p className="text-gray-500 mb-6">Por favor, tente novamente ou escolha outro método de pagamento.</p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button 
            className="w-full bg-lavapay-500 hover:bg-lavapay-600" 
            onClick={onRetry}
          >
            Tentar Novamente
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onBackToStart}
          >
            Escolher Outra Máquina
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
