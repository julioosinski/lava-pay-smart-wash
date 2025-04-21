
import { Machine } from "@/types";
import { processStonePayment } from "@/services/stonePaymentService";
import { PaymentMethod } from "../usePaymentProcessing";
import { toast } from "sonner";

// Definindo um tipo específico para os métodos de pagamento suportados pela Stone
type StonePaymentType = 'credit' | 'debit';

export function useStonePayment() {
  const processStoneCardPayment = async (
    machine: Machine,
    paymentMethod: StonePaymentType,
    amount: number,
    userId: string
  ) => {
    const stoneResponse = await processStonePayment({
      amount,
      description: `Pagamento Máquina #${machine.id}`,
      paymentMethod,
      machineId: machine.id,
      userId,
      laundryId: machine.laundry_id,
    });

    if (stoneResponse.status === 'approved') {
      toast.success('Pagamento aprovado! Sua máquina foi liberada.');
      return true;
    } else {
      throw new Error('Pagamento rejeitado pela operadora');
    }
  };

  return {
    processStoneCardPayment
  };
}
