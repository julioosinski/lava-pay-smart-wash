
// Integração com o Mercado Pago

// Este é um mock da integração com o Mercado Pago para desenvolvimento
// Em produção, isso seria implementado com a SDK real do Mercado Pago

import { Payment } from "../types";

// Tipo para preferência de pagamento do Mercado Pago
export interface PaymentPreference {
  id: string;
  init_point: string;
  external_reference: string;
}

// Mock para geração de token de pagamento
export async function generatePaymentToken(cardInfo: {
  cardNumber: string;
  cardholderName: string;
  expirationMonth: string;
  expirationYear: string;
  securityCode: string;
}): Promise<string> {
  // Em produção, isso chamaria a API real do Mercado Pago
  console.log("Generating payment token for", cardInfo);
  // Simulação de tempo de processamento
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return `mp_token_${Math.random().toString(36).substring(2, 15)}`;
}

// Mock para processamento de pagamento com cartão
export async function processCardPayment(
  token: string,
  amount: number,
  description: string,
  email: string,
  machineId: string
): Promise<Payment> {
  // Em produção, isso chamaria a API real do Mercado Pago
  console.log("Processing card payment", { token, amount, description, email, machineId });
  // Simulação de tempo de processamento
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  // 90% de chance de sucesso
  const success = Math.random() > 0.1;
  
  const payment: Payment = {
    id: Math.random().toString(36).substring(2, 10),
    machineId,
    amount,
    status: success ? 'approved' : 'rejected',
    method: Math.random() > 0.5 ? 'credit' : 'debit',
    createdAt: new Date(),
    transactionId: success ? `mp_${Math.random().toString(36).substring(2, 15)}` : undefined
  };
  
  return payment;
}

// Mock para geração de QR code PIX
export async function generatePixQRCode(
  amount: number,
  description: string,
  machineId: string
): Promise<{qrCode: string, qrCodeBase64: string, expirationTime: Date}> {
  // Em produção, isso chamaria a API real do Mercado Pago
  console.log("Generating PIX QR Code", { amount, description, machineId });
  // Simulação de tempo de processamento
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 30); // PIX expira em 30 minutos
  
  return {
    qrCode: "00020101021226880014br.gov.bcb.pix2566qrcodes-pix.mercadopago.com/abc123",
    qrCodeBase64: "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAMAAABrrFhUAAAABlBMVEX///8AAABVwtN+AAADJUlEQVR4nO3dW3LjMAxFQcn7X/ScSSYTJ5YoX7QfWcD5ruW9g9A0TdM0TdM0TdM0vfP6+/frz9ef6P3P/uvn9Zc/r7+8/vVnTE0HulJ+/bv6zK4IqZJiue4I/lT9X0zwpHBWoeclBE+N56Mj+K2+jzsAb9/wgOYEVP8BBDsFLDuC5gbUyCOQm4DiR6BGgJf/DgIh/9ugFvwCnZJ/VAuCaEr+KQ1IGp19LAHVxsGY/BMRdNR3mZqgq76b1AR99V2kCHrru0cHEFDfNSqAkPruUQCE1XeNACCuvls6gMj6LqkAQuu7owKIre+OCiC2vjsEALn13VEBxNZ3RwUQW98dFUBsfXcIAHLru/v4AJLru/vwALLru/voANLru/vgAPLru/vYAA7Ud/ehAZyo7+4jA7hS392HBXCpvruPC+BafXcfFsDN+u4+JoC79d19QACH67v7aABO13f3oQDcr+/uAwF4UN/dhwHwpL67jwHgUX13HwHAs/ru3h7A0/ruXhzAw+PvzgZw5fi7MwEcOv7uLACnjr87A8Cx4+9OB3Du+LuTAVw8/u5MAFePvzsLwN3j784AcPn4u9MBqomIAADVVDQAgGoyIgBA9QRUAEB1EloAQLUeSgBAtSJqAEC1JkoAQLUqWgBAdTJ6AEB1OooAQPUIFAGA6hmoAgDVY9AGAKoHoQsAVM9CHQConoY+AFA9DzKAA89DHQCoHggpQPVEqAGqZ0IPAKgeCkUAoHoqJAGA6rEQBQCq50ITAKieDVkAoHo6dAGA6vkQBgCqJ0QZAKieki4AUFVCAaDa6VEBqNYmdAC+egoA1eoMAEB1QAMAoLoiBQCoTkkFAKhuSgIAqMtSAADqvkQAgHpjKgBAXZoMAFD3pgMA1NUpAAD1BcAAAPUdqAAA9S2IAATVxzAAtyvQVd/dRwbQU9/dBwfQUd/dxwdwvb67DwHgan13HwXAtfruPg6AK/XdfSQA8fXdfSwA4fXdfTQAwfXdfTwAsfXdfUQAofXdfUwAkfXdfVQAgfXdfVwAcfXdBQUQ9/3vUgJE5P8+JYAegBoAUD0FbQBAXZwCAFCXpwAAVAekAABUV6QBAFR3pALQUtSHp2mapmna6/YDXIAy7aZ057kAAAAASUVORK5CYII=",
    expirationTime
  };
}

// Mock para verificação de status de pagamento PIX
export async function checkPixPaymentStatus(machineId: string): Promise<Payment | null> {
  // Em produção, isso chamaria a API real do Mercado Pago
  console.log("Checking PIX payment status for machine", machineId);
  
  // 30% de chance de pagamento já aprovado em cada verificação
  const approved = Math.random() > 0.7;
  
  if (!approved) {
    return null;
  }
  
  return {
    id: Math.random().toString(36).substring(2, 10),
    machineId,
    amount: Math.random() * 20 + 5, // Valor entre 5 e 25
    status: 'approved',
    method: 'pix',
    createdAt: new Date(),
    transactionId: `mp_pix_${Math.random().toString(36).substring(2, 15)}`
  };
}

// Mock para liberação da máquina após pagamento
export async function activateMachine(machineId: string): Promise<boolean> {
  // Em produção, isso chamaria um serviço IoT real para ativar a máquina
  console.log("Activating machine", machineId);
  // Simulação de tempo de processamento
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  // 95% de chance de sucesso na ativação
  return Math.random() > 0.05;
}
