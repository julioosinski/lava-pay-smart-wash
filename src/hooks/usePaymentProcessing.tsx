
import { useState } from 'react';
import { Platform } from "@/utils/platform";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Machine } from "@/types";
import { getMachineStatus } from "@/services/machineService";

// Importamos todos os serviços de pagamento
import { createPayment } from "@/services/mercadoPagoService";
import { processElginPayment, initializeElginSDK } from "@/services/elginPaymentService";
import { processStonePayment } from "@/services/stonePaymentService";

// Define a type for payment methods that includes all supported types
export type PaymentMethod = 'credit' | 'debit' | 'pix';

interface UsePaymentProcessingProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function usePaymentProcessing({ onSuccess, onError }: UsePaymentProcessingProps = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isElginInitialized, setIsElginInitialized] = useState(false);

  // Função para inicializar o SDK da Elgin
  const initializeElgin = async (laundryId: string) => {
    try {
      // Apenas inicializa no Android e se ainda não estiver inicializado
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

  const processPayment = async (
    machine: Machine, 
    paymentMethod: PaymentMethod,
    amount: number
  ) => {
    setIsProcessing(true);
    
    try {
      console.log(`Processando pagamento para máquina ${machine.id} com método ${paymentMethod}`);
      
      // Verifica disponibilidade da máquina antes de prosseguir
      const currentStatus = await getMachineStatus(machine.id);
      if (currentStatus?.status !== 'available') {
        throw new Error('Esta máquina não está mais disponível');
      }

      // Obtém informações do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous';

      // Determina qual provedor de pagamento usar
      // Primeiro verifica as configurações para saber qual provedor está ativo para esta lavanderia
      const { data: paymentSettings } = await supabase
        .from('payment_settings')
        .select('provider')
        .eq('laundry_id', machine.laundry_id)
        .maybeSingle();
      
      const provider = paymentSettings?.provider || 'mercado_pago';
      
      // No ambiente web ou se for PIX, usa MercadoPago, senão escolhe baseado no provedor configurado
      const useMercadoPago = Platform.OS !== 'android' || paymentMethod === 'pix';
      const useElgin = !useMercadoPago && provider === 'elgin_tef';
      const useStone = !useMercadoPago && provider === 'stone';

      // Processa o pagamento com o provedor apropriado
      if (useElgin) {
        // Inicializa e processa pagamento via Elgin
        const initialized = await initializeElgin(machine.laundry_id);
        if (!initialized) {
          throw new Error('Não foi possível inicializar o SDK da Elgin');
        }
        
        // Elgin só suporta crédito e débito, então tratamos PIX como crédito
        // Convertemos o tipo explicitamente para satisfazer o TypeScript
        const elginPaymentMethod = paymentMethod === 'pix' ? 'credit' as const : paymentMethod === 'credit' ? 'credit' as const : 'debit' as const;
        
        const elginResponse = await processElginPayment({
          amount,
          description: `Pagamento Máquina #${machine.id}`,
          paymentMethod: elginPaymentMethod,
          machineId: machine.id,
          userId,
          laundryId: machine.laundry_id,
        });
        
        if (elginResponse.status === 'approved') {
          console.log("Pagamento aprovado via Elgin");
          toast.success('Pagamento aprovado! Sua máquina foi liberada.');
          onSuccess?.();
        } else {
          console.log("Pagamento rejeitado via Elgin");
          throw new Error('Pagamento rejeitado pela operadora');
        }
      } else if (useStone) {
        // Stone só suporta crédito e débito, então tratamos PIX como crédito
        // Convertemos o tipo explicitamente para satisfazer o TypeScript
        const stonePaymentMethod = paymentMethod === 'pix' ? 'credit' as const : paymentMethod === 'credit' ? 'credit' as const : 'debit' as const;
        
        const stoneResponse = await processStonePayment({
          amount,
          description: `Pagamento Máquina #${machine.id}`,
          paymentMethod: stonePaymentMethod,
          machineId: machine.id,
          userId,
          laundryId: machine.laundry_id,
        });
        
        if (stoneResponse.status === 'approved') {
          console.log("Pagamento aprovado via Stone");
          toast.success('Pagamento aprovado! Sua máquina foi liberada.');
          onSuccess?.();
        } else {
          console.log("Pagamento rejeitado via Stone");
          throw new Error('Pagamento rejeitado pela operadora');
        }
      } else {
        // Usa a implementação existente do MercadoPago para pagamentos online
        // Cria registro de pagamento no Supabase
        const paymentData = {
          machine_id: machine.id,
          amount: amount,
          method: paymentMethod,
          status: 'pending',
          user_id: userId
        };
        
        console.log("Criando registro de pagamento:", paymentData);
        
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .insert(paymentData)
          .select()
          .single();

        if (paymentError) {
          console.error("Erro ao criar registro de pagamento:", paymentError);
          throw paymentError;
        }
        
        console.log("Registro de pagamento criado:", payment);

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
          
          console.log("Pagamento aprovado");

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
            console.error("Erro ao atualizar status da máquina:", machineUpdateError);
            throw machineUpdateError;
          }
          
          console.log("Status da máquina atualizado para em uso");
          
          toast.success('Pagamento aprovado! Sua máquina foi liberada.');
          onSuccess?.();
        } else {
          // Atualiza status do pagamento para rejeitado
          await supabase
            .from('payments')
            .update({ status: 'rejected' })
            .eq('id', payment.id);
            
          console.log("Pagamento rejeitado");
          
          throw new Error('Pagamento rejeitado pela operadora');
        }
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
      onError?.(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    isProcessing,
    initializeElgin
  };
}
