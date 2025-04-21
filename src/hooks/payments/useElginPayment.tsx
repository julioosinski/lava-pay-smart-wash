
import { useState } from 'react';
import { toast } from "sonner";
import { Machine } from "@/types";
import { processElginPayment, initializeElginSDK } from "@/services/elginPaymentService";
import { PaymentMethod } from "../usePaymentProcessing";
import { Platform } from "@/utils/platform";

// Definindo um tipo específico para os métodos de pagamento suportados pela Elgin
type ElginPaymentType = 'credit' | 'debit';

export function useElginPayment() {
  const [isElginInitialized, setIsElginInitialized] = useState(false);

  const initializeElgin = async (laundryId: string) => {
    try {
      if (Platform.OS === 'android' && !isElginInitialized) {
        const success = await initializeElginSDK(laundryId);
        setIsElginInitialized(success);
        return success;
      }
      return isElginInitialized || Platform.OS !== 'android';
    } catch (error) {
      console.error('Erro ao inicializar SDK da Elgin:', error);
      toast.error('Erro ao inicializar SDK da Elgin');
      return false;
    }
  };

  const processElginTefPayment = async (
    machine: Machine,
    paymentMethod: ElginPaymentType,
    amount: number,
    userId: string
  ) => {
    const initialized = await initializeElgin(machine.laundry_id);
    if (!initialized) {
      throw new Error('Não foi possível inicializar o SDK da Elgin');
    }
    
    const elginResponse = await processElginPayment({
      amount,
      description: `Pagamento Máquina #${machine.id}`,
      paymentMethod,
      machineId: machine.id,
      userId,
      laundryId: machine.laundry_id,
    });

    if (elginResponse.status === 'approved') {
      toast.success('Pagamento aprovado! Sua máquina foi liberada.');
      return true;
    } else {
      throw new Error('Pagamento rejeitado pela operadora');
    }
  };

  return {
    processElginTefPayment,
    initializeElgin,
    isElginInitialized
  };
}
