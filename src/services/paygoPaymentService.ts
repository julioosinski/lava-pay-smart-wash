
import { supabase } from "@/integrations/supabase/client";
import { Platform } from "@/utils/platform";

interface PaygoPaymentParams {
  amount: number;
  description: string;
  paymentMethod: 'credit' | 'debit' | 'pix';
  machineId: string;
  userId: string;
  laundryId: string;
  installments?: number;
  printReceipt?: boolean;
}

interface PaygoCancelParams {
  transactionId: string;
  machineId: string;
  laundryId: string;
  printReceipt?: boolean;
}

export const processPaygoPayment = async (params: PaygoPaymentParams) => {
  if (Platform.OS !== 'android') {
    throw new Error('PayGo TEF is only available on Android devices');
  }

  try {
    // Get PayGo settings for this laundry
    const { data: settings, error: settingsError } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('laundry_id', params.laundryId)
      .eq('provider', 'paygo_tef')
      .maybeSingle();

    if (settingsError || !settings) {
      throw new Error('PayGo TEF settings not found');
    }

    // Format amount to integer (cents)
    const amountInCents = Math.round(params.amount * 100);

    // Check if PayGo module exists
    if (!window.PaygoTefModule) {
      throw new Error('PayGo TEF module not available on this device');
    }

    // Call native PayGo TEF module
    const response = await window.PaygoTefModule.startPayment({
      clientId: settings.paygo_client_id,
      clientSecret: settings.paygo_client_secret,
      merchantId: settings.paygo_merchant_id,
      terminalId: settings.paygo_terminal_id,
      amount: amountInCents,
      paymentType: params.paymentMethod,
      installments: params.installments || 1,
      printReceipt: params.printReceipt !== false,
      description: params.description,
    });

    // Salvar os dados do recibo se disponíveis
    if (response.status === 'approved' && response.receiptMerchant) {
      await savePaymentReceipt(params.machineId, params.userId, {
        merchantReceipt: response.receiptMerchant,
        customerReceipt: response.receiptCustomer,
        transactionId: response.transactionId
      });
    }

    return {
      status: response.status === 'approved' ? 'approved' : 'rejected',
      transactionId: response.transactionId,
      message: response.message,
      pixQrCode: response.pixQrCode,
      pixQrCodeBase64: response.pixQrCodeBase64,
      cardBrand: response.cardBrand,
      authorizationCode: response.authorizationCode
    };
  } catch (error) {
    console.error('Error processing PayGo payment:', error);
    throw error;
  }
};

export const cancelPaygoPayment = async (params: PaygoCancelParams) => {
  if (Platform.OS !== 'android') {
    throw new Error('PayGo TEF is only available on Android devices');
  }

  try {
    // Get PayGo settings for this laundry
    const { data: settings, error: settingsError } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('laundry_id', params.laundryId)
      .eq('provider', 'paygo_tef')
      .maybeSingle();

    if (settingsError || !settings) {
      throw new Error('PayGo TEF settings not found');
    }

    // Check if PayGo module exists
    if (!window.PaygoTefModule) {
      throw new Error('PayGo TEF module not available on this device');
    }

    // Call native PayGo TEF module
    const response = await window.PaygoTefModule.cancelPayment({
      clientId: settings.paygo_client_id,
      clientSecret: settings.paygo_client_secret,
      merchantId: settings.paygo_merchant_id,
      terminalId: settings.paygo_terminal_id,
      transactionId: params.transactionId,
      printReceipt: params.printReceipt !== false
    });

    return {
      status: response.status,
      message: response.message
    };
  } catch (error) {
    console.error('Error canceling PayGo payment:', error);
    throw error;
  }
};

export const checkPaygoDeviceStatus = async (laundryId: string) => {
  if (Platform.OS !== 'android') {
    return { isConnected: false, message: 'PayGo TEF is only available on Android devices' };
  }

  try {
    // Check if PayGo module exists
    if (!window.PaygoTefModule) {
      return { isConnected: false, message: 'PayGo TEF module not available on this device' };
    }

    // Call native PayGo TEF module
    const response = await window.PaygoTefModule.checkDeviceStatus();
    
    return response;
  } catch (error) {
    console.error('Error checking PayGo device status:', error);
    return { isConnected: false, message: error.message };
  }
};

// Função para salvar os recibos de pagamento
async function savePaymentReceipt(machineId: string, userId: string, receiptData: { 
  merchantReceipt: string, 
  customerReceipt: string, 
  transactionId: string 
}) {
  try {
    await supabase.from('payment_receipts').insert({
      machine_id: machineId,
      user_id: userId,
      transaction_id: receiptData.transactionId,
      merchant_receipt: receiptData.merchantReceipt,
      customer_receipt: receiptData.customerReceipt,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving payment receipt:', error);
    // Não interrompe o fluxo se falhar ao salvar o recibo
  }
}
