
interface PaygoTefModule {
  startPayment(params: {
    clientId: string;
    clientSecret: string;
    merchantId: string;
    terminalId: string;
    amount: number;
    paymentType: 'credit' | 'debit' | 'pix';
    installments: number;
    printReceipt: boolean;
    description: string;
  }): Promise<{
    status: 'approved' | 'rejected' | 'error';
    transactionId?: string;
    message?: string;
    pixQrCode?: string; // QR Code em formato string
    pixQrCodeBase64?: string; // QR Code em formato base64
    receiptMerchant?: string; // Via do estabelecimento
    receiptCustomer?: string; // Via do cliente
    authorizationCode?: string; // Código de autorização
    cardBrand?: string; // Bandeira do cartão
    cardLastDigits?: string; // Últimos dígitos do cartão
  }>;

  cancelPayment(params: {
    clientId: string;
    clientSecret: string;
    merchantId: string;
    terminalId: string;
    transactionId: string;
    printReceipt: boolean;
  }): Promise<{
    status: 'approved' | 'rejected' | 'error';
    message?: string;
  }>;

  printReceipt(params: {
    receiptContent: string;
    isCustomerReceipt: boolean;
  }): Promise<{
    success: boolean;
    message?: string;
  }>;

  checkDeviceStatus(): Promise<{
    isConnected: boolean;
    deviceInfo?: {
      model: string;
      serialNumber: string;
    };
  }>;
}

interface Window {
  PaygoTefModule?: PaygoTefModule;
}
