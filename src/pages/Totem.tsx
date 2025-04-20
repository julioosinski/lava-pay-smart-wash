
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { LaundryLocation, Machine } from "@/types";
import { usePaymentProcessing } from "@/hooks/usePaymentProcessing";
import { useMachineMonitoring } from "@/hooks/useMachineMonitoring";
import { useLaundries } from "@/hooks/useLaundries";
import { useMachines } from "@/hooks/useMachines";
import { LaundrySelection } from "@/components/totem/LaundrySelection";
import { MachineSelection } from "@/components/totem/MachineSelection";
import { PaymentMethodSelector } from "@/components/totem/PaymentMethodSelector";
import { ProcessingPayment } from "@/components/totem/ProcessingPayment";
import { PaymentSuccess } from "@/components/totem/PaymentSuccess";
import { PaymentError } from "@/components/totem/PaymentError";

export default function Totem() {
  const [step, setStep] = useState<"select-laundry" | "select-machine" | "payment" | "processing" | "success" | "error">("select-laundry");
  const [selectedLaundry, setSelectedLaundry] = useState<LaundryLocation | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "debit" | "pix">("credit");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixQRCode, setPixQRCode] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardholderName: "",
    expirationMonth: "",
    expirationYear: "",
    securityCode: ""
  });

  // Fetch laundries and machines
  const { data: laundries = [] } = useLaundries();
  const { data: machines = [] } = useMachines(selectedLaundry?.id);

  const { processPayment, isProcessing: paymentIsProcessing } = usePaymentProcessing({
    onSuccess: () => setStep("success"),
    onError: () => setStep("error")
  });

  useMachineMonitoring();

  const handleLaundrySelect = (laundry: LaundryLocation) => {
    setSelectedLaundry(laundry);
    setStep("select-machine");
  };

  const handleMachineSelect = (machine: Machine) => {
    setSelectedMachine(machine);
    setStep("payment");
  };

  const handleBackToLaundries = () => {
    setSelectedLaundry(null);
    setSelectedMachine(null);
    setStep("select-laundry");
    setPixQRCode(null);
  };

  const handleBackToMachines = () => {
    setSelectedMachine(null);
    setStep("select-machine");
    setPixQRCode(null);
  };

  const handleBackToPayment = () => {
    setStep("payment");
    setIsProcessing(false);
    setPixQRCode(null);
  };

  const handleCardFieldChange = (field: string, value: string) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCardPayment = async () => {
    if (!selectedMachine) return;

    setIsProcessing(true);
    setStep("processing");

    try {
      await processPayment(
        selectedMachine, 
        paymentMethod === 'credit' ? 'credit' : 'debit',
        selectedMachine.price
      );
    } catch (error) {
      console.error("Erro no pagamento:", error);
      setStep("error");
    }
  };

  const handlePixPayment = async () => {
    if (!selectedMachine) return;

    setIsProcessing(true);
    
    try {
      await processPayment(selectedMachine, 'pix', selectedMachine.price);
    } catch (error) {
      console.error("Erro no pagamento PIX:", error);
      setStep("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const isCardFormValid = () => {
    return (
      cardDetails.cardNumber.length >= 16 &&
      cardDetails.cardholderName.length >= 3 &&
      cardDetails.expirationMonth.length === 2 &&
      cardDetails.expirationYear.length === 2 &&
      cardDetails.securityCode.length >= 3
    );
  };

  // Filter available machines for the selected laundry
  const availableMachines = machines.filter(machine => 
    machine.status === "available" && machine.laundry_id === selectedLaundry?.id
  );

  return (
    <Layout>
      {step === "select-laundry" && (
        <LaundrySelection 
          laundries={laundries} 
          onLaundrySelect={handleLaundrySelect}
        />
      )}
      {step === "select-machine" && selectedLaundry && (
        <MachineSelection 
          machines={availableMachines} 
          onMachineSelect={handleMachineSelect}
        />
      )}
      {step === "payment" && selectedMachine && (
        <PaymentMethodSelector
          selectedMachine={selectedMachine}
          onBackClick={handleBackToMachines}
          onPaymentSubmit={handleCardPayment}
          cardDetails={cardDetails}
          onCardDetailsChange={handleCardFieldChange}
          isCardFormValid={isCardFormValid()}
          pixQRCode={pixQRCode}
          handlePixPayment={handlePixPayment}
        />
      )}
      {step === "processing" && <ProcessingPayment />}
      {step === "success" && (
        <PaymentSuccess 
          machine={selectedMachine}
          onBackToStart={handleBackToLaundries}
        />
      )}
      {step === "error" && (
        <PaymentError
          onRetry={handleBackToPayment}
          onBackToStart={handleBackToLaundries}
        />
      )}
    </Layout>
  );
}
