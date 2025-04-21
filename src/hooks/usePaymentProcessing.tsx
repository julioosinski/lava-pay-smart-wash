
import { useState } from 'react';
import { Platform } from 'react-native';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Machine } from "@/types";
import { getMachineStatus } from "@/services/machineService";

// Importamos tanto o serviço MercadoPago quanto o novo serviço Stone
import { createPayment } from "@/services/mercadoPagoService";
import { processStonePayment, initializeStoneSDK } from "@/services/stonePaymentService";

interface UsePaymentProcessingProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function usePaymentProcessing({ onSuccess, onError }: UsePaymentProcessingProps = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStoneInitialized, setIsStoneInitialized] = useState(false);

  // Função para inicializar o SDK da Stone
  const initializeStone = async (laundryId: string) => {
    try {
      // Apenas inicializa no Android e se ainda não estiver inicializado
      if (Platform.OS === 'android' && !isStoneInitialized) {
        const success = await initializeStoneSDK(laundryId);
        setIsStoneInitialized(success);
        return success;
      }
      return isStoneInitialized || Platform.OS !== 'android';
    } catch (error) {
      console.error('Error initializing Stone SDK:', error);
      toast.error('Erro ao inicializar SDK da Stone');
      return false;
    }
  };

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

      // Get current user info
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous';

      // Determina se deve usar o TEF da Stone (maquininha física) ou MercadoPago (online)
      // No ambiente web ou se for PIX, usa MercadoPago, senão usa Stone no Android
      const useStone = Platform.OS === 'android' && paymentMethod !== 'pix';

      // Se for usar a Stone, certifique-se de que o SDK está inicializado
      if (useStone) {
        const initialized = await initializeStone(machine.laundry_id);
        if (!initialized) {
          throw new Error('Não foi possível inicializar o SDK da Stone');
        }
        
        // Processa pagamento via maquininha física da Stone
        const stoneResponse = await processStonePayment({
          amount,
          description: `Pagamento Máquina #${machine.id}`,
          paymentMethod,
          machineId: machine.id,
          userId,
          laundryId: machine.laundry_id,
        });
        
        if (stoneResponse.status === 'approved') {
          console.log("Payment approved via Stone");
          toast.success('Pagamento aprovado! Sua máquina foi liberada.');
          onSuccess?.();
        } else {
          console.log("Payment rejected via Stone");
          throw new Error('Pagamento rejeitado pela operadora');
        }
      } else {
        // Usa a implementação existente do MercadoPago para pagamentos online
        // Create payment record in Supabase
        const paymentData = {
          machine_id: machine.id,
          amount: amount,
          method: paymentMethod,
          status: 'pending',
          user_id: userId
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

        // Process payment with MercadoPago
        const mercadoPagoResponse = await createPayment(
          amount,
          `Pagamento Máquina #${machine.id}`,
          machine.laundry_id,
          paymentMethod
        );
        
        if (mercadoPagoResponse.status === 'approved') {
          // Update payment status to approved
          const { error: updateError } = await supabase
            .from('payments')
            .update({ 
              status: 'approved',
              transaction_id: mercadoPagoResponse.transactionId
            })
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
    isProcessing,
    initializeStone
  };
}
