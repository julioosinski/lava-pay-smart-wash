
import { supabase } from "@/integrations/supabase/client";
import { Platform } from "@/utils/platform";
import { NativeModules } from "@/utils/nativeModules";

const { StonePayment } = NativeModules;

interface PaymentConfig {
  stoneCode: string;
  merchantName: string;
  sandboxMode: boolean;
}

async function getStoneConfig(laundryId: string): Promise<PaymentConfig | null> {
  try {
    const { data: settings, error } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('laundry_id', laundryId)
      .eq('provider', 'stone')
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar configurações de pagamento Stone:', error);
      return null;
    }

    if (!settings) {
      console.error('Configurações de pagamento Stone não encontradas');
      return null;
    }

    if (!settings.stone_code || !settings.merchant_name) {
      console.error('Configurações de pagamento Stone incompletas');
      return null;
    }

    return {
      stoneCode: settings.stone_code,
      merchantName: settings.merchant_name,
      sandboxMode: settings.sandbox_mode || true
    };
  } catch (error) {
    console.error('Erro ao buscar configurações Stone:', error);
    return null;
  }
}

export interface StonePaymentOptions {
  amount: number;
  description: string;
  paymentMethod: 'credit' | 'debit';
  machineId: string;
  userId: string;
  laundryId: string;
}

export async function processStonePayment(options: StonePaymentOptions) {
  try {
    if (Platform.OS !== 'android') {
      throw new Error('Pagamentos via Stone só estão disponíveis no Android');
    }

    console.log(`Processando pagamento via Stone para máquina ${options.machineId}`);
    
    const config = await getStoneConfig(options.laundryId);
    if (!config) {
      throw new Error('Configuração de pagamento Stone não encontrada');
    }
    
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

    const result = await StonePayment.processPayment({
      amount: options.amount,
      description: options.description,
      paymentMethod: options.paymentMethod,
      stoneCode: config.stoneCode,
      merchantName: config.merchantName,
      sandboxMode: config.sandboxMode
    });

    console.log("Resultado do pagamento Stone:", result);

    if (result.status === 'approved') {
      await supabase
        .from('payments')
        .update({ 
          status: 'approved',
          transaction_id: result.transactionId
        })
        .eq('id', payment.id);

      await supabase
        .from('machines')
        .update({ 
          status: 'in-use',
          current_session_start: new Date().toISOString(),
          current_payment_id: payment.id
        })
        .eq('id', options.machineId);
        
      return {
        status: 'approved',
        transactionId: result.transactionId
      };
    } else {
      await supabase
        .from('payments')
        .update({ 
          status: 'rejected',
          transaction_id: result.transactionId
        })
        .eq('id', payment.id);
        
      return {
        status: 'rejected',
        message: 'Pagamento rejeitado pela operadora'
      };
    }
  } catch (error) {
    console.error('Erro ao processar pagamento Stone:', error);
    throw error;
  }
}
