
import { Machine } from "@/types";
import { usePaymentProcessing } from "@/hooks/usePaymentProcessing";
import { Platform } from "@/utils/platform";
import { useEffect, createContext, useContext } from "react";
import { TotemStep } from "@/hooks/useTotemState";

interface TotemPaymentHandlerProps {
  selectedMachine: Machine | null;
  selectedLaundryId: string | undefined;
  setStep: (step: TotemStep) => void;
  children: React.ReactNode;
}

// Create a context to provide payment functions to children
export const PaymentContext = createContext<{
  processPayment: (machine: Machine, paymentMethod: 'credit' | 'debit' | 'pix', amount: number) => Promise<boolean>;
  isProcessing: boolean;
} | undefined>(undefined);

export function usePaymentContext() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error("usePaymentContext must be used within a TotemPaymentHandler");
  }
  return context;
}

export function TotemPaymentHandler({ 
  selectedMachine, 
  selectedLaundryId,
  setStep,
  children 
}: TotemPaymentHandlerProps) {
  const { processPayment, isProcessing, initializeElgin } = usePaymentProcessing({
    onSuccess: () => {
      setStep("success");
    },
    onError: () => {
      setStep("error");
    }
  });

  useEffect(() => {
    if (selectedLaundryId && Platform.OS === 'android') {
      initializeElgin(selectedLaundryId)
        .then(success => {
          if (success) {
            console.log('SDK da Elgin inicializado com sucesso');
          }
        })
        .catch(error => {
          console.error('Erro ao inicializar SDK da Elgin:', error);
        });
    }
  }, [selectedLaundryId]);

  return (
    <PaymentContext.Provider value={{ processPayment, isProcessing }}>
      {children}
    </PaymentContext.Provider>
  );
}
