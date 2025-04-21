import { Platform } from "@/utils/platform";
import { NativeModules } from "@/utils/nativeModules";
import { supabase } from "@/integrations/supabase/client";

const { ElginPayment } = NativeModules;

interface PaymentConfig {
  clientId: string;
  clientSecret: string;
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
 * Obtém a configuração de pagamento da Elgin para a lavanderia
 */
async function getElginConfig(laundryId: string): Promise<PaymentConfig | null> {
  try {
    const { data: settings, error } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('laundry_id', laundryId)
      .eq('provider', 'elgin_tef')
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar configurações de pagamento Elgin:', error);
      return null;
    }

    if (!settings) {
      console.error('Configurações de pagamento Elgin não encontradas');
      return null;
    }

    // Make sure all required fields exist before returning
    if (!settings.client_id || !settings.client_secret || !settings.merchant_name) {
      console.error('Configurações de pagamento Elgin incompletas');
      return null;
    }

    return {
      clientId: settings.client_id,
      clientSecret: settings.client_secret,
      merchantName: settings.merchant_name,
      sandboxMode: settings.sandbox_mode || true
    };
  } catch (error) {
    console.error('Erro ao buscar configurações Elgin:', error);
    return null;
  }
}

/**
 * Inicializa o SDK da Elgin
 */
export async function initializeElginSDK(laundryId: string): Promise<boolean> {
  try {
    // Verifica se está rodando no Android
    if (Platform.OS !== 'android') {
      console.log('O SDK da Elgin só está disponível no Android');
      return false;
    }

    const config = await getElginConfig(laundryId);
    if (!config) {
      throw new Error('Configuração de pagamento Elgin não encontrada');
    }

    await ElginPayment.initialize(config.clientId, config.clientSecret);
    console.log('SDK da Elgin inicializado com sucesso');
    
    return true;
  } catch (error) {
    console.error('Erro ao inicializar SDK da Elgin:', error);
    throw error;
  }
}

/**
 * Processa pagamento através do TEF Elgin
 */
export async function processElginPayment(options: PaymentOptions): Promise<PaymentResult> {
  try {
    // Verifica se estamos no Android
    if (Platform.OS !== 'android') {
      throw new Error('Pagamentos via TEF Elgin só estão disponíveis no Android');
    }

    console.log(`Processando pagamento via TEF Elgin para máquina ${options.machineId}`);
    
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
      console.error("Erro ao criar registro de pagamento:", paymentError);
      throw paymentError;
    }
    
    console.log("Registro de pagamento criado:", payment);

    // Processa o pagamento através do TEF Elgin
    const result = await ElginPayment.processPayment({
      amount: options.amount,
      description: options.description,
      paymentMethod: options.paymentMethod,
      installments: options.installments || 1
    });

    console.log("Resultado do pagamento Elgin:", result);

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

    return result as PaymentResult;
  } catch (error) {
    console.error('Erro ao processar pagamento Elgin:', error);
    throw error;
  }
}
