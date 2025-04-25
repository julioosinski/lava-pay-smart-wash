
import { Machine } from "@/types";
import { usePaymentProcessing } from "@/hooks/usePaymentProcessing";
import { Platform } from "@/utils/platform";
import { useEffect } from "react";
import { TotemStep } from "@/hooks/useTotemState";

interface TotemPaymentHandlerProps {
  selectedMachine: Machine | null;
  selectedLaundryId: string | undefined;
  setStep: (step: TotemStep) => void;
  children: React.ReactNode;
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

  return children;
}
