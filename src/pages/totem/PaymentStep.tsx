
import { Machine } from "@/types";
import { PaymentMethodSelector } from "@/components/totem/PaymentMethodSelector";

interface PaymentStepProps {
  selectedMachine: Machine;
  cardDetails: {
    cardNumber: string;
    cardholderName: string;
    expirationMonth: string;
    expirationYear: string;
    securityCode: string;
  };
  onCardDetailsChange: (field: string, value: string) => void;
  onBack: () => void;
  onPaymentSubmit: () => void;
  onPaymentMethodChange: (method: "credit" | "debit" | "pix") => void;
  isCardFormValid: boolean;
  pixQRCode: string | null;
  handlePixPayment: () => void;
}
export function PaymentStep({
  selectedMachine,
  cardDetails,
  onCardDetailsChange,
  onBack,
  onPaymentSubmit,
  onPaymentMethodChange,
  isCardFormValid,
  pixQRCode,
  handlePixPayment,
}: PaymentStepProps) {
  return (
    <PaymentMethodSelector
      selectedMachine={selectedMachine}
      onBackClick={onBack}
      onPaymentSubmit={onPaymentSubmit}
      onPaymentMethodChange={onPaymentMethodChange}
      cardDetails={cardDetails}
      onCardDetailsChange={onCardDetailsChange}
      isCardFormValid={isCardFormValid}
      pixQRCode={pixQRCode}
      handlePixPayment={handlePixPayment}
    />
  );
}
