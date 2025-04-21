
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Machine } from "@/types";
import { createPayment } from "@/services/mercadoPagoService";
import { PaymentMethod } from "../usePaymentProcessing";

export function useMercadoPagoPayment() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processMercadoPagoPayment = async (
    machine: Machine,
    paymentMethod: PaymentMethod,
    amount: number,
    userId: string
  ) => {
    try {
      // Cria registro de pagamento no Supabase
      const paymentData = {
        machine_id: machine.id,
        amount: amount,
        method: paymentMethod,
        status: 'pending',
        user_id: userId
      };
      
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single();

      if (paymentError) {
        console.error("Erro ao criar registro de pagamento:", paymentError);
        throw paymentError;
      }

      // Processa pagamento com MercadoPago
      const mercadoPagoResponse = await createPayment(
        amount,
        `Pagamento Máquina #${machine.id}`,
        machine.laundry_id,
        paymentMethod
      );
      
      if (mercadoPagoResponse.status === 'approved') {
        // Atualiza status do pagamento para aprovado
        const { error: updateError } = await supabase
          .from('payments')
          .update({ 
            status: 'approved',
            transaction_id: mercadoPagoResponse.transactionId
          })
          .eq('id', payment.id);
          
        if (updateError) {
          console.error("Erro ao atualizar status do pagamento:", updateError);
          throw updateError;
        }

        // Atualiza status da máquina para em uso
        const { error: machineUpdateError } = await supabase
          .from('machines')
          .update({ 
            status: 'in-use',
            current_session_start: new Date().toISOString(),
            current_payment_id: payment.id
          })
          .eq('id', machine.id);
          
        if (machineUpdateError) {
          throw machineUpdateError;
        }
        
        toast.success('Pagamento aprovado! Sua máquina foi liberada.');
        return true;
      } else {
        // Atualiza status do pagamento para rejeitado
        await supabase
          .from('payments')
          .update({ status: 'rejected' })
          .eq('id', payment.id);
          
        throw new Error('Pagamento rejeitado pela operadora');
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    processMercadoPagoPayment,
    isProcessing
  };
}
