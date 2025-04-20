
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
      console.log(`Processing payment for machine ${machine.id} with method ${paymentMethod}`);
      
      // Verify machine availability before proceeding
      const currentStatus = await getMachineStatus(machine.id);
      if (currentStatus?.status !== 'available') {
        throw new Error('Esta máquina não está mais disponível');
      }

      // Create payment record in Supabase
      const paymentData = {
        machine_id: machine.id,
        laundry_id: machine.laundry_id,
        amount: amount,
        method: paymentMethod,
        status: 'pending',
        user_id: (await supabase.auth.getUser()).data.user?.id || 'anonymous'
      };
      
      console.log("Creating payment record:", paymentData);
      
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single();

      if (paymentError) {
        console.error("Error creating payment record:", paymentError);
        throw paymentError;
      }
      
      console.log("Payment record created:", payment);

      // Simulate payment processing with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demonstration purposes: 90% success rate
      const success = Math.random() > 0.1;
      
      if (success) {
        // Update payment status to approved
        const { error: updateError } = await supabase
          .from('payments')
          .update({ status: 'approved' })
          .eq('id', payment.id);
          
        if (updateError) {
          console.error("Error updating payment status:", updateError);
          throw updateError;
        }
        
        console.log("Payment approved");

        // Update machine status to in-use
        const { error: machineUpdateError } = await supabase
          .from('machines')
          .update({ 
            status: 'in-use',
            current_session_start: new Date().toISOString(),
            current_payment_id: payment.id
          })
          .eq('id', machine.id);
          
        if (machineUpdateError) {
          console.error("Error updating machine status:", machineUpdateError);
          throw machineUpdateError;
        }
        
        console.log("Machine status updated to in-use");
        
        toast.success('Pagamento aprovado! Sua máquina foi liberada.');
        onSuccess?.();
      } else {
        // Update payment status to rejected
        await supabase
          .from('payments')
          .update({ status: 'rejected' })
          .eq('id', payment.id);
          
        console.log("Payment rejected");
        
        throw new Error('Pagamento rejeitado pela operadora');
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
