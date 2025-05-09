
import { supabase } from "@/integrations/supabase/client";
import { Platform } from "@/utils/platform";

interface PaygoPaymentParams {
  amount: number;
  description: string;
  paymentMethod: 'credit' | 'debit' | 'pix';
  machineId: string;
  userId: string;
  laundryId: string;
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
      installments: 1,
      printReceipt: true,
      description: params.description,
    });

    return {
      status: response.status === 'approved' ? 'approved' : 'rejected',
      transactionId: response.transactionId,
      message: response.message,
      pixQrCode: response.pixQrCode,
      pixQrCodeBase64: response.pixQrCodeBase64
    };
  } catch (error) {
    console.error('Error processing PayGo payment:', error);
    throw error;
  }
};
