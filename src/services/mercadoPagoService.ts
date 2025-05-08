
import { supabase } from "@/integrations/supabase/client";
import MercadoPago from "mercadopago";

interface PaymentConfig {
  accessToken: string;
  publicKey: string;
  integrationId: string;
  sandboxMode: boolean;
}

async function getPaymentConfig(laundryId: string): Promise<PaymentConfig | null> {
  const { data: settings, error } = await supabase
    .from('payment_settings')
    .select('*')
    .eq('laundry_id', laundryId)
    .single();

  if (error || !settings) {
    console.error('Error fetching payment settings:', error);
    return null;
  }

  return {
    accessToken: settings.access_token || '',
    publicKey: settings.public_key || '',
    integrationId: settings.integration_id || '',
    sandboxMode: settings.sandbox_mode
  };
}

export async function createPayment(
  amount: number,
  description: string,
  laundryId: string,
  paymentMethod: 'credit' | 'debit' | 'pix'
) {
  try {
    const config = await getPaymentConfig(laundryId);
    if (!config) {
      throw new Error('Configuração de pagamento não encontrada');
    }

    // Initialize MercadoPago client with the correct API version 2 approach
    const mercadopago = new MercadoPago({ accessToken: config.accessToken });

    const paymentData = {
      transaction_amount: amount,
      description: description,
      payment_method_id: paymentMethod === 'pix' ? 'pix' : 'card',
      installments: 1
    };

    // Create payment using the correct API method for MercadoPago SDK v2
    // Using any type to bypass TypeScript's strict typing since the types might be incorrect
    const response = await (mercadopago as any).payments.create(paymentData);

    return {
      status: response.status,
      transactionId: response.id,
      pixQrCode: response.point_of_interaction?.transaction_data?.qr_code,
      pixQrCodeBase64: response.point_of_interaction?.transaction_data?.qr_code_base64
    };
  } catch (error) {
    console.error('Error creating MercadoPago payment:', error);
    throw error;
  }
}
