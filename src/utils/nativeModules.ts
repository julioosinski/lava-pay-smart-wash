
/**
 * Mock for React Native's NativeModules
 * This provides a web-compatible alternative for the React Native NativeModules
 */

const mockStonePayment = {
  initialize: async (stoneCode: string) => {
    console.log('Mock Stone SDK initialize called with:', stoneCode);
    return Promise.resolve(true);
  },
  
  processPayment: async (options: any) => {
    console.log('Mock Stone SDK processPayment called with:', options);
    // Simulate successful payment after 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 90% chance of successful payment
    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        transactionId: `stone_${Date.now()}`,
        receiptCode: `receipt_${Math.floor(Math.random() * 1000000)}`,
        status: 'approved',
      };
    } else {
      throw new Error('Payment rejected or failed');
    }
  }
};

export const NativeModules = {
  StonePayment: mockStonePayment
};
