
import { useState, useEffect } from "react";
import { Platform } from "@/utils/platform";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { LaundryLocation, Machine } from "@/types";
import { usePaymentProcessing } from "@/hooks/usePaymentProcessing";
import { useMachineMonitoring } from "@/hooks/useMachineMonitoring";
import { useLaundries } from "@/hooks/useLaundries";
import { useMachines } from "@/hooks/useMachines";

import { SelectLaundryStep } from "./totem/SelectLaundryStep";
import { SelectMachineStep } from "./totem/SelectMachineStep";
import { PaymentStep } from "./totem/PaymentStep";
import { ProcessingStep } from "./totem/ProcessingStep";
import { SuccessStep } from "./totem/SuccessStep";
import { ErrorStep } from "./totem/ErrorStep";

export default function Totem() {
  const [step, setStep] = useState<
    "select-laundry" | "select-machine" | "payment" | "processing" | "success" | "error"
  >("select-laundry");
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

  const { data: laundries = [], isLoading: laundriesLoading } = useLaundries();
  const { data: machines = [], isLoading: machinesLoading } = useMachines(selectedLaundry?.id);

  const { processPayment, isProcessing: paymentIsProcessing, initializeStone } = usePaymentProcessing({
    onSuccess: () => {
      setStep("success");
    },
    onError: () => {
      setStep("error");
    }
  });

  useMachineMonitoring(selectedLaundry?.id);

  useEffect(() => {
    if (selectedLaundry && Platform.OS === 'android') {
      initializeStone(selectedLaundry.id)
        .then(success => {
          if (success) {
            console.log('SDK da Stone inicializado com sucesso');
          }
        })
        .catch(error => {
          console.error('Erro ao inicializar SDK da Stone:', error);
        });
    }
  }, [selectedLaundry]);

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
    setPixQRCode(null);
  };

  const handleCardFieldChange = (field: string, value: string) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentMethodChange = (method: "credit" | "debit" | "pix") => {
    setPaymentMethod(method);
  };

  const handleCardPayment = async () => {
    if (!selectedMachine) {
      toast.error("Nenhuma máquina selecionada");
      return;
    }
    setStep("processing");
    try {
      await processPayment(
        selectedMachine, 
        paymentMethod,
        selectedMachine.price
      );
    } catch (error) {
      setStep("error");
    }
  };

  const handlePixPayment = async () => {
    if (!selectedMachine) {
      toast.error("Nenhuma máquina selecionada");
      return;
    }
    // Simula a geração do QR Code PIX (mock em ambiente web)
    setPixQRCode("iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAMAAABrrFhUAAAABlBMVEX///8AAABVwtN+AAADJUlEQVR4nO3dW3LjMAxFQcn7X/ScSSYTJ5YoX7QfWcD5ruW9g9A0TdM0TdM0TdM0vfP6+/frz9ef6P3P/uvn9Zc/r7+8/vVnTE0HulJ+/bv6zK4IqZJiue4I/lT9X0zwpHBWoeclBE+N56Mj+K2+jzsAb9/wgOYEVP8BBDsFLDuC5gbUyCOQm4DiR6BGgJf/DgIh/9ugFvwCnZJ/VAuCaEr+KQ1IGp19LAHVxsGY/BMRdNR3mZqgq76b1AR99V2kCHrru0cHEFDfNSqAkPruUQCE1XeNACCuvls6gMj6LqkAQuu7owKIre+OCiC2vjsEALn13VEBxNZ3RwUQW98dFUBsfXcIAHLru/v4AJLru/vwALLru/voANLru/vgAPLru/vYAA7Ud/ehAZyo7+4jA7hS392HBXCpvruPC+BafXcfFsDN+u4+JoC79d19QACH67v7aABO13f3oQDcr+/uAwF4UN/dhwHwpL67jwHgUX13HwHAs/ru3h7A0/ruXhzAw+PvzgZw5fi7MwEcOv7uLACnjr87A8Cx4+9OB3Du+LuTAVw8/u5MAFePvzsLwN3j784AcPn4u9MBqomIAADVVDQAgGoyIgBA9QRUAEB1EloAQLUeSgBAdSJqAEC1JkoAQLUqWgBAdTJ6AEB1OooAQPUIFAGA6hmoAgDVY9AGAKoHoQsAVM9CHQConoY+AFA9DzKAA89DHQCoHggpQPVEqAGqZ0IPAKgeCkUAoHoqJAGA6rEQBQCq50ITAKieDVkAoHo6dAGA6vkQBgCqJ0QZAKieki4AUFVCAaDa6VEBqNYmdAC+egoA1eoMAEB1QAMAoLoiBQCoTkkFAKhuSgIAqMtSAADqvkQAgHpjKgBAXZoMAFD3pgMA1NUpAAD1BcAAAPUdqAAA9S2IAATVxzAAtyvQVd/dRwbQU9/dBwfQUd/dxwdwvb67DwHgan13HwXAtfruPg6AK/XdfSQA8fXdfSwAwfXdfTQAwfXdfTwAsfXdfUQAofXdfUwAkfXdfVQAgfXdfVwAcfXdBQUQ9/3vUgJE5P8+JYAegBoAUD0FbQBAXZwCAFCXpwAAVAekAABUV6QBAFR3pALQUtSHp2mapmna6/YDXIAy7aZ057kAAAAASUVORK5CYII=");
    setTimeout(async () => {
      try {
        await processPayment(selectedMachine, 'pix', selectedMachine.price);
      } catch (error) {
        setStep("error");
      }
    }, 3000);
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

  return (
    <Layout>
      {step === "select-laundry" && (
        <SelectLaundryStep 
          laundries={laundries}
          onSelect={handleLaundrySelect}
          loading={laundriesLoading}
        />
      )}
      {step === "select-machine" && selectedLaundry && (
        <SelectMachineStep
          machines={machines}
          onSelect={handleMachineSelect}
          onBack={handleBackToLaundries}
          loading={machinesLoading}
        />
      )}
      {step === "payment" && selectedMachine && (
        <PaymentStep
          selectedMachine={selectedMachine}
          cardDetails={cardDetails}
          onCardDetailsChange={handleCardFieldChange}
          onBack={handleBackToMachines}
          onPaymentSubmit={handleCardPayment}
          onPaymentMethodChange={handlePaymentMethodChange}
          isCardFormValid={isCardFormValid()}
          pixQRCode={pixQRCode}
          handlePixPayment={handlePixPayment}
        />
      )}
      {step === "processing" && <ProcessingStep />}
      {step === "success" && selectedMachine && (
        <SuccessStep 
          machine={selectedMachine}
          onBackToStart={handleBackToLaundries}
        />
      )}
      {step === "error" && (
        <ErrorStep
          onRetry={handleBackToPayment}
          onBackToStart={handleBackToLaundries}
        />
      )}
    </Layout>
  );
}
