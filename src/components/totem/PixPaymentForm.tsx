
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PixPaymentFormProps {
  qrCode: string | null;
  onGenerateQRCode: () => void;
}

export function PixPaymentForm({ qrCode, onGenerateQRCode }: PixPaymentFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamento por PIX</CardTitle>
        <CardDescription>Escaneie o QR Code com o aplicativo do seu banco.</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {qrCode ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="border-2 border-lavapay-100 p-4 rounded-md inline-block">
              <img 
                src={`data:image/png;base64,${qrCode}`} 
                alt="QR Code PIX" 
                className="h-48 w-48" 
              />
            </div>
            <p className="text-sm text-gray-500">
              Escaneie o código acima com o aplicativo do seu banco ou carteira digital
            </p>
            <div className="flex items-center justify-center text-amber-600">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>Aguardando pagamento...</span>
            </div>
          </div>
        ) : (
          <div className="py-6">
            <Button 
              className="w-full bg-lavapay-500 hover:bg-lavapay-600" 
              onClick={onGenerateQRCode}
            >
              Gerar QR Code PIX
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
