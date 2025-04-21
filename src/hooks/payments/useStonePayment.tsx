
import { Machine } from "@/types";
import { processStonePayment } from "@/services/stonePaymentService";
import { PaymentMethod } from "../usePaymentProcessing";
import { toast } from "sonner";
import { sendCommandToMachine } from '@/services/esp32';

// Definindo um tipo específico para os métodos de pagamento suportados pela Stone
type StonePaymentType = 'credit' | 'debit';

export function useStonePayment() {
  const processStoneCardPayment = async (
    machine: Machine,
    paymentMethod: StonePaymentType,
    amount: number,
    userId: string
  ) => {
    try {
      const stoneResponse = await processStonePayment({
        amount,
        description: `Pagamento Máquina #${machine.id}`,
        paymentMethod,
        machineId: machine.id,
        userId,
        laundryId: machine.laundry_id,
      });

      if (stoneResponse.status === 'approved') {
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
      console.error('Erro ao processar pagamento Stone:', error);
      throw error;
    }
  };

  return {
    processStoneCardPayment
  };
}
