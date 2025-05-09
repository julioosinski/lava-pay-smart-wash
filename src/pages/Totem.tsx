
import { Layout } from "@/components/Layout";
import { useLaundries } from "@/hooks/useLaundries";
import { useMachines } from "@/hooks/useMachines";
import { useMachineMonitoring } from "@/hooks/useMachineMonitoring";
import { useAuth } from "@/contexts/auth";
import { useTotemState } from "@/hooks/useTotemState";
import { toast } from "sonner";
import { TotemPaymentHandler, usePaymentContext } from "@/components/totem/TotemPaymentHandler";

import { SelectLaundryStep } from "./totem/SelectLaundryStep";
import { SelectMachineStep } from "./totem/SelectMachineStep";
import { PaymentStep } from "./totem/PaymentStep";
import { ProcessingStep } from "./totem/ProcessingStep";
import { SuccessStep } from "./totem/SuccessStep";
import { ErrorStep } from "./totem/ErrorStep";
import { useEffect } from "react";

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

  // Buscar apenas lavanderias do proprietário logado
  const { data: laundries = [], isLoading: laundriesLoading } = useLaundries({ 
    ownerId: user?.id,
    options: {
      enabled: !!user?.id
    }
  });

  // Buscar máquinas apenas para a lavanderia selecionada
  const { data: machines = [], isLoading: machinesLoading } = useMachines(selectedLaundry?.id);

  // Monitorar as máquinas da lavanderia selecionada
  useMachineMonitoring(selectedLaundry?.id);

  useEffect(() => {
    // Se não houver lavanderias carregadas, mostrar mensagem informativa
    if (!laundriesLoading && laundries.length === 0 && user) {
      toast.warning("Você não possui lavanderias cadastradas. Acesse o painel do proprietário para cadastrar.");
    }
  }, [laundries, laundriesLoading, user]);

  return (
    <Layout>
      <TotemPaymentHandler 
        selectedMachine={selectedMachine}
        selectedLaundryId={selectedLaundry?.id}
        setStep={setStep}
      >
        {(() => {
          // Using a function to access context only when component is mounted inside TotemPaymentHandler
          const PaymentContent = () => {
            const { processPayment } = usePaymentContext();

            const handleCardPayment = async () => {
              if (!selectedMachine) {
                toast.error("Nenhuma máquina selecionada");
                return;
              }
              setStep("processing");
              
              try {
                await processPayment(selectedMachine, paymentMethod, selectedMachine.price);
              } catch (error) {
                // Error is already handled by the payment hook
                console.error("Erro no processamento do pagamento:", error);
              }
            };
          
            const handlePixPayment = async () => {
              if (!selectedMachine) {
                toast.error("Nenhuma máquina selecionada");
                return;
              }
              setPixQRCode("iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAMAAABrrFhUAAAABlBMVEX///8AAABVwtN+AAADJUlEQVR4nO3dW3LjMAxFQcn7X/ScSSYTJ5YoX7QfWcD5ruW9g9A0TdM0TdM0TdM0vfP6+/frz9ef6P3P/uvn9Zc/r7+8/vVnTE0HulJ+/bv6zK4IqZJiue4I/lT9X0zwpHBWoeclBE+N56Mj+K2+jzsAb9/wgOYEVP8BBDsFLDuC5gbUyCOQm4DiR6BGgJf/DgIh/9ugFvwCnZJ/VAuCaEr+KQ1IGp19LAHVxsGY/BMRdNR3mZqgr76b1AR99V2kCHrru0cHEFDfNSqAkPruUQCE1XeNACCuvls6gMj6LqkAQuu7owKIre+OCiC2vjsEALn13VEBxNZ3RwUQW98dFUBsfXcIAHLru/v4AJLru/vwALLru/voANLru/vgAPLru/vYAA7Ud/ehAZyo7+4jA7hS392HBXCpvruPC+BafXcfFsDN+u4+JoC79d19QACH67v7aABO13f3oQDcr+/uAwF4UN/dhwHwpL67jwHgUX13HwHAs/ruXhzAw/ruXhzAw+PvzgZw5fi7MwEcOv7uLACnjr87A8Cx4+9OB3Du+LuTAVw8/u5MAFePvzsLwN3j784AcPn4u9MBqomIAADVVDQAgGoyIgBA9QRUAEB1EloAQLUeSgBAtSJqAEC1JkoAQLUqWgBAdTJ6AEB1OooAQPUIFAGA6hmoAgDVY9AGAKoHoQsAVM9CHQConoY+AFA9DzKAA89DHQCoHggpQPVEqAGqZ0IPAKieCkUAoHoqJAGA6rEQBQCq50ITAKieDVkAoHo6dAGA6vkQBgCqJ0QZAKieEkUAoHo6dAGAZ0MAAAOiSQSAaqVHBqNYmdAB+egoA1QoMAEB1QEMAKBaiBQAQLUiCgBAXZoCAFD3pgIA1NXpAAD1BcAAAPUdqAAA9S2IAATVxzAAtyvQVd/dRwbQU9/dBwfQUd/dxwdwvb67DwHgan13HwXAtfruPg6AK/XdfSQA8fXdfSwAwfXdfTQAwfXdfTwAsfXdfUQAofXdfUwAkfXdfVQAgfXdfVwAcfXdBQUQ9/3vUgJE5P8+JYAegBoAUD0FbQBAXZwCAFCXpwAAVAekAABUV6QBAFR3pALQUtSHp2mapmna6/YDXIAy7aZ057kAAAAASUVORK5CYII=");
              
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

            if (step === "select-laundry") {
              return (
                <SelectLaundryStep 
                  laundries={laundries}
                  onSelect={handleLaundrySelect}
                  loading={laundriesLoading}
                />
              );
            }
            
            if (step === "select-machine" && selectedLaundry) {
              return (
                <SelectMachineStep
                  machines={machines}
                  onSelect={handleMachineSelect}
                  onBack={handleBackToLaundries}
                  loading={machinesLoading}
                  selectedLaundryId={selectedLaundry.id}
                />
              );
            }
            
            if (step === "payment" && selectedMachine) {
              return (
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
              );
            }
            
            if (step === "processing") {
              return <ProcessingStep />;
            }
            
            if (step === "success" && selectedMachine) {
              return (
                <SuccessStep 
                  machine={selectedMachine}
                  onBackToStart={handleBackToLaundries}
                />
              );
            }
            
            if (step === "error") {
              return (
                <ErrorStep
                  onRetry={handleBackToPayment}
                  onBackToStart={handleBackToLaundries}
                />
              );
            }
            
            return null;
          };
          
          return <PaymentContent />;
        })()}
      </TotemPaymentHandler>
    </Layout>
  );
}
