
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

export function CreditCardPaymentForm({
  cardDetails,
  onCardDetailsChange,
  onSubmit,
  isFormValid
}: CardPaymentFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cartão de Crédito</CardTitle>
        <CardDescription>Pague com seu cartão de crédito.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ccnumber">Número do Cartão</Label>
          <Input 
            id="ccnumber" 
            placeholder="0000 0000 0000 0000" 
            value={cardDetails.cardNumber}
            onChange={(e) => onCardDetailsChange("cardNumber", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ccname">Nome no Cartão</Label>
          <Input 
            id="ccname" 
            placeholder="Nome impresso no cartão" 
            value={cardDetails.cardholderName}
            onChange={(e) => onCardDetailsChange("cardholderName", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ccmonth">Mês</Label>
            <Input 
              id="ccmonth" 
              placeholder="MM" 
              maxLength={2}
              value={cardDetails.expirationMonth}
              onChange={(e) => onCardDetailsChange("expirationMonth", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ccyear">Ano</Label>
            <Input 
              id="ccyear" 
              placeholder="AA" 
              maxLength={2}
              value={cardDetails.expirationYear}
              onChange={(e) => onCardDetailsChange("expirationYear", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cccvv">CVV</Label>
            <Input 
              id="cccvv" 
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
          Pagar com Crédito
        </Button>
      </CardFooter>
    </Card>
  );
}
