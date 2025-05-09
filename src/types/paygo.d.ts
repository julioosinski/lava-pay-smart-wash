
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
  }>;
}

interface Window {
  PaygoTefModule?: PaygoTefModule;
}
