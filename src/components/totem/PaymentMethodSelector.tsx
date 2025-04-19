
import { ArrowLeft } from "lucide-react";
import { Machine } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCardPaymentForm } from "./CreditCardPaymentForm";
import { DebitCardPaymentForm } from "./DebitCardPaymentForm";
import { PixPaymentForm } from "./PixPaymentForm";
import { PaymentSummary } from "./PaymentSummary";
import { CreditCard, Banknote, QrCode } from "lucide-react";

interface PaymentMethodSelectorProps {
  selectedMachine: Machine;
  onBackClick: () => void;
  onPaymentSubmit: (method: 'credit' | 'debit' | 'pix') => void;
  cardDetails: {
    cardNumber: string;
    cardholderName: string;
    expirationMonth: string;
    expirationYear: string;
    securityCode: string;
  };
  onCardDetailsChange: (field: string, value: string) => void;
  isCardFormValid: boolean;
  pixQRCode: string | null;
  handlePixPayment: () => void;
}

export function PaymentMethodSelector({
  selectedMachine,
  onBackClick,
  onPaymentSubmit,
  cardDetails,
  onCardDetailsChange,
  isCardFormValid,
  pixQRCode,
  handlePixPayment
}: PaymentMethodSelectorProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-2" onClick={onBackClick}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold">Escolha como pagar</h1>
      </div>

      <PaymentSummary machine={selectedMachine} />
      
      <Tabs defaultValue="credit">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="credit" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Crédito
          </TabsTrigger>
          <TabsTrigger value="debit" className="flex items-center gap-2">
            <Banknote className="h-4 w-4" /> Débito
          </TabsTrigger>
          <TabsTrigger value="pix" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" /> PIX
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="credit">
          <CreditCardPaymentForm
            cardDetails={cardDetails}
            onCardDetailsChange={onCardDetailsChange}
            onSubmit={() => onPaymentSubmit('credit')}
            isFormValid={isCardFormValid}
          />
        </TabsContent>
        
        <TabsContent value="debit">
          <DebitCardPaymentForm
            cardDetails={cardDetails}
            onCardDetailsChange={onCardDetailsChange}
            onSubmit={() => onPaymentSubmit('debit')}
            isFormValid={isCardFormValid}
          />
        </TabsContent>
        
        <TabsContent value="pix">
          <PixPaymentForm
            qrCode={pixQRCode}
            onGenerateQRCode={handlePixPayment}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
