
import { Layout } from "@/components/Layout";
import { useLaundries } from "@/hooks/useLaundries";
import { useMachines } from "@/hooks/useMachines";
import { useMachineMonitoring } from "@/hooks/useMachineMonitoring";
import { useAuth } from "@/contexts/auth";
import { useTotemState } from "@/hooks/useTotemState";
import { toast } from "sonner";
import { TotemPaymentHandler } from "@/components/totem/TotemPaymentHandler";

import { SelectLaundryStep } from "./totem/SelectLaundryStep";
import { SelectMachineStep } from "./totem/SelectMachineStep";
import { PaymentStep } from "./totem/PaymentStep";
import { ProcessingStep } from "./totem/ProcessingStep";
import { SuccessStep } from "./totem/SuccessStep";
import { ErrorStep } from "./totem/ErrorStep";

export default function Totem() {
  const { user } = useAuth();
  const {
    step,
    setStep,
    selectedLaundry,
    selectedMachine,
    paymentMethod,
    pixQRCode,
    cardDetails,
    setPixQRCode,
    setPaymentMethod,
    handleLaundrySelect,
    handleMachineSelect,
    handleBackToLaundries,
    handleBackToMachines,
    handleBackToPayment,
    handleCardFieldChange
  } = useTotemState();

  // Fetch only laundries owned by the logged-in user
  const { data: laundries = [], isLoading: laundriesLoading } = useLaundries({ 
    ownerId: user?.id,
    options: {
      enabled: !!user?.id
    }
  });

  // Fetch machines for the selected laundry
  const { data: machines = [], isLoading: machinesLoading } = useMachines(selectedLaundry?.id);

  useMachineMonitoring(selectedLaundry?.id);

  const handleCardPayment = async () => {
    if (!selectedMachine) {
      toast.error("Nenhuma máquina selecionada");
      return;
    }
    setStep("processing");
  };

  const handlePixPayment = async () => {
    if (!selectedMachine) {
      toast.error("Nenhuma máquina selecionada");
      return;
    }
    setPixQRCode("iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAMAAABrrFhUAAAABlBMVEX///8AAABVwtN+AAADJUlEQVR4nO3dW3LjMAxFQcn7X/ScSSYTJ5YoX7QfWcD5ruW9g9A0TdM0TdM0TdM0vfP6+/frz9ef6P3P/uvn9Zc/r7+8/vVnTE0HulJ+/bv6zK4IqZJiue4I/lT9X0zwpHBWoeclBE+N56Mj+K2+jzsAb9/wgOYEVP8BBDsFLDuC5gbUyCOQm4DiR6BGgJf/DgIh/9ugFvwCnZJ/VAuCaEr+KQ1IGp19LAHVxsGY/BMRdNR3mZqgq76b1AR99V2kCHrru0cHEFDfNSqAkPruUQCE1XeNACCuvls6gMj6LqkAQuu7owKIre+OCiC2vjsEALn13VEBxNZ3RwUQW98dFUBsfXcIAHLru/v4AJLru/voALLru/vYANLru/vgAPLru/voANLru/vYAA7Ud/ehAZyo7+4jA7hS392HBXCpvruPC+BafXcfFsDN+u4+JoC79d19QACH67v7aABO13f3oQDcr+/uAwF4UN/dxwHwpL67jwHgUX13HwHAs/ruXhzAw+PvzgZw5fi7MwEcOv7uLACnjr87A8Cx4+9OB3Du+LuTAVw8/u5MAFePvzsLwN3j784AcPn4u9MBqomIAADVVDQAgGoyIgBA9QRUAEB1EloAQLUeSgBAdSJqAEC1JkoAQLUqWgBAdTJ6AEB1OooAQPUIFAGA6hmoAgDVY9AGAKoHoQsAVM9CHQConoY+AFA9DzKAA89DHQCoHggpQPVEqAGqZ0IPAKgeCkUAoHoqJAGA6rEQBQCq50ITAKieDVkAoHo6dAGA6vkQBgCqJ0QZAKieEkUAoHo6dAGAZ0MAAAOiSURBVFVCAaDa6VEBqNYmdAC+egoA1eoMAEB1QAMAoLoiBQCoTkkFAKhuSgIAqMtSAADqvkQAgHpjKgBAXZoMAFD3pgMA1NUpAAD1BcAAAPUdqAAA9S2IAATVxzAAtyvQVd/dRwbQU9/dBwfQUd/dxwdwvb67DwHgan13HwXAtfruPg6AK/XdfSQA8fXdfSwAwfXdfTQAwfXdfTwAsfXdfUQAofXdfUwAkfXdfVQAgfXdfVwAcfXdBQUQ9/3vUgJE5P8+JYAegBoAUD0FbQBAXZwCAFCXpwAAVAekAABUV6QBAFR3pALQUtSHp2mapmna6/YDXIAy7aZ057kAAAAASUVORK5CYII=");
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
      <TotemPaymentHandler 
        selectedMachine={selectedMachine}
        selectedLaundryId={selectedLaundry?.id}
        setStep={setStep}
      >
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
            selectedLaundryId={selectedLaundry.id}
          />
        )}
        {step === "payment" && selectedMachine && (
          <PaymentStep
            selectedMachine={selectedMachine}
            cardDetails={cardDetails}
            onCardDetailsChange={handleCardFieldChange}
            onBack={handleBackToMachines}
            onPaymentSubmit={handleCardPayment}
            onPaymentMethodChange={setPaymentMethod}
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
      </TotemPaymentHandler>
    </Layout>
  );
}
