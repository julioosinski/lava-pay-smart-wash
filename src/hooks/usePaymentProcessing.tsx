
import { useState } from 'react';
import { Platform } from "@/utils/platform";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Machine } from "@/types";
import { getMachineStatus } from "@/services/machineService";
import { useMercadoPagoPayment } from "./payments/useMercadoPagoPayment";
import { useElginPayment } from "./payments/useElginPayment";
import { useStonePayment } from "./payments/useStonePayment";

export type PaymentMethod = 'credit' | 'debit' | 'pix';

interface UsePaymentProcessingProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function usePaymentProcessing({ onSuccess, onError }: UsePaymentProcessingProps = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { processMercadoPagoPayment } = useMercadoPagoPayment();
  const { processElginTefPayment, initializeElgin, isElginInitialized } = useElginPayment();
  const { processStoneCardPayment } = useStonePayment();

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

      let success = false;

      // Helper function to convert payment method
      const convertPaymentMethod = (method: PaymentMethod): 'credit' | 'debit' => {
        if (method === 'pix') {
          console.log(`PIX não suportado diretamente. Usando crédito como fallback.`);
          return 'credit';
        }
        return method;
      };

      if (useElgin) {
        const elginMethod = convertPaymentMethod(paymentMethod);
        success = await processElginTefPayment(machine, elginMethod, amount, userId);
      } else if (useStone) {
        const stoneMethod = convertPaymentMethod(paymentMethod);
        success = await processStoneCardPayment(machine, stoneMethod, amount, userId);
      } else {
        success = await processMercadoPagoPayment(machine, paymentMethod, amount, userId);
      }

      if (success) {
        onSuccess?.();
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

