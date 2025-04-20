
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
  const [pixQRCode, setPixQRCode] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardholderName: "",
    expirationMonth: "",
    expirationYear: "",
    securityCode: ""
  });

  // Fetch laundries
  const { data: laundries = [], isLoading: laundriesLoading } = useLaundries();
  
  // Fetch machines only when a laundry is selected
  const { data: machines = [], isLoading: machinesLoading } = useMachines(selectedLaundry?.id);

  const { processPayment, isProcessing: paymentIsProcessing } = usePaymentProcessing({
    onSuccess: () => setStep("success"),
    onError: () => setStep("error")
  });

  // Start monitoring machine status
  useMachineMonitoring(selectedLaundry?.id);

  const handleLaundrySelect = (laundry: LaundryLocation) => {
    console.log("Laundry selected:", laundry);
    setSelectedLaundry(laundry);
    setStep("select-machine");
  };

  const handleMachineSelect = (machine: Machine) => {
    console.log("Machine selected:", machine);
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
    
    try {
      // Gerar QR Code do PIX aqui
      setPixQRCode("pix-qrcode-placeholder");
      
      // Em um caso real, você processaria o pagamento quando confirmado
      // Para este exemplo, simulamos o processamento após um delay
      setTimeout(async () => {
        try {
          await processPayment(selectedMachine, 'pix', selectedMachine.price);
        } catch (error) {
          console.error("Erro no pagamento PIX:", error);
          setStep("error");
        }
      }, 3000);
    } catch (error) {
      console.error("Erro ao gerar QR Code PIX:", error);
      setStep("error");
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

  console.log("Current step:", step);
  console.log("Laundries:", laundries);
  console.log("Selected laundry:", selectedLaundry);
  console.log("Machines:", machines);
  console.log("Selected machine:", selectedMachine);

  return (
    <Layout>
      {step === "select-laundry" && (
        <LaundrySelection 
          laundries={laundries} 
          onLaundrySelect={handleLaundrySelect}
          loading={laundriesLoading}
        />
      )}
      {step === "select-machine" && selectedLaundry && (
        <MachineSelection 
          machines={machines} 
          onMachineSelect={handleMachineSelect}
          onBackClick={handleBackToLaundries}
          loading={machinesLoading}
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
