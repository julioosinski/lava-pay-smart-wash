export interface BasePaymentSettings {
  sandbox_mode: boolean;
  terminal_serial?: string;
  terminal_model?: string;
  merchant_name?: string;
}

export interface MercadoPagoSettings extends BasePaymentSettings {
  access_token: string;
  public_key: string;
  integration_id: string;
}

export interface ElginSettings extends BasePaymentSettings {
  client_id: string;
  client_secret: string;
}

export interface StoneSettings extends BasePaymentSettings {
  stone_code: string;
}

export interface PaygoSettings extends BasePaymentSettings {
  paygo_client_id: string;
  paygo_client_secret: string;
  paygo_terminal_id: string;
  paygo_merchant_id: string;
}

export type PaymentProvider = 'mercado_pago' | 'elgin_tef' | 'stone' | 'paygo_tef';

export type PaymentSettings = (MercadoPagoSettings | ElginSettings | StoneSettings | PaygoSettings) & {
  provider: PaymentProvider;
};
