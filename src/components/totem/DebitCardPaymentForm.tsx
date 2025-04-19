
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CardPaymentFormProps {
  cardDetails: {
    cardNumber: string;
    cardholderName: string;
    expirationMonth: string;
    expirationYear: string;
    securityCode: string;
  };
  onCardDetailsChange: (field: string, value: string) => void;
  onSubmit: () => void;
  isFormValid: boolean;
}

export function DebitCardPaymentForm({
  cardDetails,
  onCardDetailsChange,
  onSubmit,
  isFormValid
}: CardPaymentFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cartão de Débito</CardTitle>
        <CardDescription>Pague com seu cartão de débito.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dcnumber">Número do Cartão</Label>
          <Input 
            id="dcnumber" 
            placeholder="0000 0000 0000 0000" 
            value={cardDetails.cardNumber}
            onChange={(e) => onCardDetailsChange("cardNumber", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dcname">Nome no Cartão</Label>
          <Input 
            id="dcname" 
            placeholder="Nome impresso no cartão" 
            value={cardDetails.cardholderName}
            onChange={(e) => onCardDetailsChange("cardholderName", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dcmonth">Mês</Label>
            <Input 
              id="dcmonth" 
              placeholder="MM" 
              maxLength={2}
              value={cardDetails.expirationMonth}
              onChange={(e) => onCardDetailsChange("expirationMonth", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dcyear">Ano</Label>
            <Input 
              id="dcyear" 
              placeholder="AA" 
              maxLength={2}
              value={cardDetails.expirationYear}
              onChange={(e) => onCardDetailsChange("expirationYear", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dccvv">CVV</Label>
            <Input 
              id="dccvv" 
              placeholder="123" 
              maxLength={4}
              value={cardDetails.securityCode}
              onChange={(e) => onCardDetailsChange("securityCode", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-lavapay-500 hover:bg-lavapay-600"
          onClick={onSubmit}
          disabled={!isFormValid}
        >
          Pagar com Débito
        </Button>
      </CardFooter>
    </Card>
  );
}
