
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
      return {
        transactionId: `paygo_${Date.now()}`,
        status: 'approved' as const,
        message: 'Pagamento aprovado'
      };
    } else {
      return {
        status: 'rejected' as const,
        message: 'Pagamento rejeitado pela operadora'
      };
    }
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
