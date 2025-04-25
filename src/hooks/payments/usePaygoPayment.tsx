
import { useState } from 'react';
import { toast } from "sonner";
import { Machine } from "@/types";
import { processPaygoPayment } from "@/services/paygoPaymentService";
import { PaymentMethod } from "../usePaymentProcessing";
import { sendCommandToMachine } from '@/services/esp32';

type PaygoPaymentType = 'credit' | 'debit';

export function usePaygoPayment() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processPaygoTefPayment = async (
    machine: Machine,
    paymentMethod: PaygoPaymentType,
    amount: number,
    userId: string
  ) => {
    try {
      setIsProcessing(true);
      const paygoResponse = await processPaygoPayment({
        amount,
        description: `Pagamento Máquina #${machine.id}`,
        paymentMethod,
        machineId: machine.id,
        userId,
        laundryId: machine.laundry_id,
      });

      if (paygoResponse.status === 'approved') {
        // Envia comando para o ESP32 iniciar a máquina
        const commandResult = await sendCommandToMachine(
          machine, 
          'start', 
          machine.time_minutes * 60 // Duração em segundos
        );
        
        if (!commandResult) {
          toast.warning('Pagamento aprovado, mas houve um problema ao iniciar a máquina. Por favor, contate um administrador.');
        }
        
        toast.success('Pagamento aprovado! Sua máquina foi liberada.');
        return true;
      } else {
        throw new Error('Pagamento rejeitado pela operadora');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento PayGo:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPaygoTefPayment,
    isProcessing
  };
}
