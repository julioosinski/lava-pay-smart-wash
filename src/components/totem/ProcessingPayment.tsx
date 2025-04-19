
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function ProcessingPayment() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-md text-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Processando Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="py-8 flex flex-col items-center">
          <Loader2 className="h-16 w-16 text-lavapay-600 animate-spin mb-6" />
          <p className="text-lg">Aguarde, estamos processando seu pagamento...</p>
          <p className="text-sm text-gray-500 mt-4">Não feche ou atualize esta página</p>
        </CardContent>
      </Card>
    </div>
  );
}
