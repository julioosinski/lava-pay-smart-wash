
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Machine, Payment } from "@/types";
import { getMachineStatus } from "@/services/machineService";

interface UsePaymentProcessingProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function usePaymentProcessing({ onSuccess, onError }: UsePaymentProcessingProps = {}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const processPayment = async (
    machine: Machine, 
    paymentMethod: 'credit' | 'debit' | 'pix',
    amount: number
  ) => {
    setIsProcessing(true);
    
    try {
      // Verify machine availability before proceeding
      const currentStatus = await getMachineStatus(machine.id);
      if (currentStatus?.status !== 'available') {
        throw new Error('Esta máquina não está mais disponível');
      }

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          machine_id: machine.id,
          laundry_id: machine.laundry_id,
          amount: amount,
          method: paymentMethod,
          status: 'pending',
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Process payment with selected method
      // This is where you would integrate with real payment providers
      // For now, we'll simulate a successful payment
      const success = Math.random() > 0.1; // 90% success rate for testing

      if (success) {
        await supabase
          .from('payments')
          .update({ status: 'approved' })
          .eq('id', payment.id);

        toast.success('Pagamento aprovado! Sua máquina será liberada em instantes.');
        onSuccess?.();
      } else {
        await supabase
          .from('payments')
          .update({ status: 'rejected' })
          .eq('id', payment.id);

        throw new Error('Pagamento rejeitado');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
      onError?.(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    isProcessing
  };
}
