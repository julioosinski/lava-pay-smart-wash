
interface PaygoTefModule {
  startPayment(params: {
    clientId: string;
    clientSecret: string;
    merchantId: string;
    terminalId: string;
    amount: number;
    paymentType: 'credit' | 'debit';
    installments: number;
    printReceipt: boolean;
    description: string;
  }): Promise<{
    status: 'approved' | 'rejected' | 'error';
    transactionId?: string;
    message?: string;
  }>;
}

interface Window {
  PaygoTefModule?: PaygoTefModule;
}
