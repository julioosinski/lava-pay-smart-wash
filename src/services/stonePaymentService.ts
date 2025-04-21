
import { Platform } from "@/utils/platform";
import { NativeModules } from "@/utils/nativeModules";
import { supabase } from "@/integrations/supabase/client";

const { StonePayment } = NativeModules;

interface PaymentConfig {
  stoneCode: string;
  merchantName: string;
  sandboxMode: boolean;
}

interface PaymentOptions {
  amount: number;
  description: string;
  paymentMethod: 'credit' | 'debit';
  installments?: number;
  machineId: string;
  userId: string;
  laundryId: string;
}

interface PaymentResult {
  transactionId: string;
  receiptCode: string;
  status: 'approved' | 'rejected' | 'error';
  message?: string;
}

/**
 * Obtém a configuração de pagamento da Stone para a lavanderia
 */
async function getStoneConfig(laundryId: string): Promise<PaymentConfig | null> {
  const { data: settings, error } = await supabase
    .from('payment_settings')
    .select('stone_code, merchant_name, sandbox_mode')
    .eq('laundry_id', laundryId)
    .single();

  if (error || !settings) {
    console.error('Error fetching Stone payment settings:', error);
    return null;
  }

  return {
    stoneCode: settings.stone_code || '',
    merchantName: settings.merchant_name || '',
    sandboxMode: settings.sandbox_mode || true
  };
}

/**
 * Inicializa o SDK da Stone
 */
export async function initializeStoneSDK(laundryId: string): Promise<boolean> {
  try {
    // Apenas inicializa no Android
    if (Platform.OS !== 'android') {
      console.log('Stone SDK só está disponível no Android');
      return false;
    }

    const config = await getStoneConfig(laundryId);
    if (!config) {
      throw new Error('Configuração de pagamento Stone não encontrada');
    }

    await StonePayment.initialize(config.stoneCode);
    console.log('Stone SDK inicializado com sucesso');
    
    return true;
  } catch (error) {
    console.error('Error initializing Stone SDK:', error);
    throw error;
  }
}

/**
 * Processa pagamento através da maquininha Stone
 */
export async function processStonePayment(options: PaymentOptions): Promise<PaymentResult> {
  try {
    // Verifica se estamos no Android
    if (Platform.OS !== 'android') {
      throw new Error('Pagamentos via maquininha Stone só estão disponíveis no Android');
    }

    console.log(`Processando pagamento via maquininha Stone para máquina ${options.machineId}`);
    
    // Registra o pagamento como pendente no banco de dados
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        machine_id: options.machineId,
        amount: options.amount,
        method: options.paymentMethod,
        status: 'pending',
        user_id: options.userId,
        laundry_id: options.laundryId
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      throw paymentError;
    }
    
    console.log("Payment record created:", payment);

    // Processa o pagamento através da maquininha Stone
    const result = await StonePayment.processPayment({
      amount: options.amount,
      description: options.description,
      paymentMethod: options.paymentMethod,
      installments: options.installments || 1
    });

    console.log("Stone payment result:", result);

    // Atualiza o pagamento com o resultado da transação
    if (result.status === 'approved') {
      await supabase
        .from('payments')
        .update({ 
          status: 'approved',
          transaction_id: result.transactionId
        })
        .eq('id', payment.id);

      // Atualiza o status da máquina para em uso
      await supabase
        .from('machines')
        .update({ 
          status: 'in-use',
          current_session_start: new Date().toISOString(),
          current_payment_id: payment.id
        })
        .eq('id', options.machineId);
    } else {
      await supabase
        .from('payments')
        .update({ 
          status: 'rejected',
          transaction_id: result.transactionId
        })
        .eq('id', payment.id);
    }

    return result;
  } catch (error) {
    console.error('Error processing Stone payment:', error);
    throw error;
  }
}
