
import { Machine } from "@/types";
import { processStonePayment } from "@/services/stonePaymentService";
import { PaymentMethod } from "../usePaymentProcessing";
import { toast } from "sonner";

export function useStonePayment() {
  const processStoneCardPayment = async (
    machine: Machine,
    paymentMethod: PaymentMethod,
    amount: number,
    userId: string
  ) => {
    // Stone só suporta crédito e débito, então tratamos PIX como crédito
    const stonePaymentMethod = paymentMethod === 'pix' ? 'credit' : 
                             paymentMethod === 'credit' ? 'credit' : 'debit';
    
    type StonePaymentType = 'credit' | 'debit';
    
    const stoneResponse = await processStonePayment({
      amount,
      description: `Pagamento Máquina #${machine.id}`,
      paymentMethod: stonePaymentMethod as StonePaymentType,
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
