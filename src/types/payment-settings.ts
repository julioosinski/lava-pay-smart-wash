
export interface BasePaymentSettings {
  sandbox_mode: boolean;
}

export interface MercadoPagoSettings extends BasePaymentSettings {
  access_token: string;
  public_key: string;
  integration_id: string;
}

export interface ElginSettings extends BasePaymentSettings {
  client_id: string;
  client_secret: string;
  merchant_name: string;
}

export type PaymentProvider = 'mercado_pago' | 'elgin_tef';

export type PaymentSettings = (MercadoPagoSettings | ElginSettings) & {
  provider: PaymentProvider;
};
