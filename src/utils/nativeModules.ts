
/**
 * Mock para módulos nativos do React Native
 * Isso fornece uma alternativa compatível com web para os módulos nativos do React Native
 */

const mockElginPayment = {
  initialize: async (clientId: string, clientSecret: string) => {
    console.log('Mock Elgin TEF initialize called with:', { clientId, clientSecret });
    return Promise.resolve(true);
  },
  
  processPayment: async (options: any) => {
    console.log('Mock Elgin TEF processPayment called with:', options);
    // Simula pagamento bem-sucedido após 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 90% de chance de pagamento bem-sucedido
    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        transactionId: `elgin_${Date.now()}`,
        receiptCode: `receipt_${Math.floor(Math.random() * 1000000)}`,
        status: 'approved',
      };
    } else {
      throw new Error('Pagamento rejeitado ou falhou');
    }
  }
};

const mockStonePayment = {
  processPayment: async (options: any) => {
    console.log('Mock Stone processPayment called with:', options);
    // Simula pagamento bem-sucedido após 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 90% de chance de pagamento bem-sucedido
    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        transactionId: `stone_${Date.now()}`,
        status: 'approved',
      };
    } else {
      throw new Error('Pagamento rejeitado pela operadora');
    }
  }
};

const mockPaygoTefModule = {
  startPayment: async (options: any) => {
    console.log('Mock PayGo TEF startPayment called with:', options);
    // Simula pagamento bem-sucedido após 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 90% de chance de pagamento bem-sucedido
    const success = Math.random() > 0.1;
    
    if (success) {
      // Se for pagamento PIX, incluir QR Code de exemplo
      if (options.paymentType === 'pix') {
        return {
          transactionId: `paygo_${Date.now()}`,
          status: 'approved' as const,
          message: 'QR Code PIX gerado com sucesso',
          pixQrCode: 'pixcode123456789',
          pixQrCodeBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
          receiptMerchant: 'COMPROVANTE LOJISTA\nTRANSACAO APROVADA\nVALOR: R$ 10,00',
          receiptCustomer: 'COMPROVANTE CLIENTE\nTRANSACAO APROVADA\nVALOR: R$ 10,00'
        };
      }
      
      return {
        transactionId: `paygo_${Date.now()}`,
        status: 'approved' as const,
        message: 'Pagamento aprovado',
        receiptMerchant: 'COMPROVANTE LOJISTA\nTRANSACAO APROVADA\nVALOR: R$ 10,00',
        receiptCustomer: 'COMPROVANTE CLIENTE\nTRANSACAO APROVADA\nVALOR: R$ 10,00',
        cardBrand: 'Mastercard',
        authorizationCode: 'AUTH123456'
      };
    } else {
      return {
        status: 'rejected' as const,
        message: 'Pagamento rejeitado pela operadora'
      };
    }
  },
  
  cancelPayment: async (options: any) => {
    console.log('Mock PayGo TEF cancelPayment called with:', options);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const success = Math.random() > 0.1;
    
    return {
      status: success ? 'approved' as const : 'error' as const,
      message: success ? 'Estorno realizado com sucesso' : 'Falha ao cancelar pagamento'
    };
  },
  
  printReceipt: async (options: any) => {
    console.log('Mock PayGo TEF printReceipt called with:', options);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Comprovante impresso com sucesso'
    };
  },
  
  checkDeviceStatus: async () => {
    console.log('Mock PayGo TEF checkDeviceStatus called');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      isConnected: true,
      deviceInfo: {
        model: 'PayGo Mock POS',
        serialNumber: `MOCK-${Math.floor(Math.random() * 100000)}`
      }
    };
  }
};

export const NativeModules = {
  ElginPayment: mockElginPayment,
  StonePayment: mockStonePayment
};

// Add PayGo TEF module to window object for web testing
if (typeof window !== 'undefined') {
  window.PaygoTefModule = mockPaygoTefModule;
}
