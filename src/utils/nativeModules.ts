
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

export const NativeModules = {
  ElginPayment: mockElginPayment
};
