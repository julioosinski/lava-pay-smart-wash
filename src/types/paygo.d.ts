
// Definição de tipos para o módulo PayGo TEF
interface PaygoTefModule {
  startPayment: (options: PaygoPaymentOptions) => Promise<PaygoPaymentResponse>;
  cancelPayment: (options: PaygoCancelOptions) => Promise<PaygoCancelResponse>;
  printReceipt: (options: PaygoPrintOptions) => Promise<PaygoPrintResponse>;
  checkDeviceStatus: () => Promise<PaygoDeviceStatus>;
}

interface PaygoPaymentOptions {
  clientId: string;
  clientSecret: string;
  merchantId: string;
  terminalId: string;
  amount: number;
  paymentType: string;
  installments?: number;
  printReceipt?: boolean;
  description?: string;
}

interface PaygoPaymentResponse {
  status: 'approved' | 'rejected' | 'error';
  transactionId?: string;
  message?: string;
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  cardBrand?: string;
  authorizationCode?: string;
  receiptMerchant?: string;
  receiptCustomer?: string;
}

interface PaygoCancelOptions {
  clientId: string;
  clientSecret: string;
  merchantId: string;
  terminalId: string;
  transactionId: string;
  printReceipt?: boolean;
}

interface PaygoCancelResponse {
  status: 'approved' | 'rejected' | 'error';
  message?: string;
}

interface PaygoPrintOptions {
  receiptData: string;
  isCustomerReceipt: boolean;
}

interface PaygoPrintResponse {
  success: boolean;
  message?: string;
}

interface PaygoDeviceStatus {
  isConnected: boolean;
  deviceInfo?: {
    model: string;
    serialNumber: string;
  };
  message?: string;
}

// Estender o objeto window global para incluir o módulo PayGo TEF
interface Window {
  PaygoTefModule?: PaygoTefModule;
}
