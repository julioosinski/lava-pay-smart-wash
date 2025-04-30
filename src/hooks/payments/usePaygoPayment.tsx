
import { useState } from 'react';
import { toast } from "sonner";
import { Machine } from "@/types";
import { processPaygoPayment, cancelPaygoPayment, checkPaygoDeviceStatus } from "@/services/paygoPaymentService";
import { PaymentMethod } from "../usePaymentProcessing";
import { sendCommandToMachine } from '@/services/esp32';

type PaygoPaymentType = 'credit' | 'debit' | 'pix';

export function usePaygoPayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState<{
    isConnected: boolean;
    deviceInfo?: { model: string; serialNumber: string };
    message?: string;
  } | null>(null);

  const processPaygoTefPayment = async (
    machine: Machine,
    paymentMethod: PaygoPaymentType,
    amount: number,
    userId: string
  ) => {
    try {
      setIsProcessing(true);
      const paygoResponse = await processPaygoPayment({
        amount,
        description: `Pagamento Máquina #${machine.id}`,
        paymentMethod,
        machineId: machine.id,
        userId,
        laundryId: machine.laundry_id,
        installments: 1,
        printReceipt: true
      });

      if (paygoResponse.status === 'approved') {
        // Envia comando para o ESP32 iniciar a máquina
        const commandResult = await sendCommandToMachine(
          machine, 
          'start', 
          machine.time_minutes * 60 // Duração em segundos
        );
        
        if (!commandResult) {
          toast.warning('Pagamento aprovado, mas houve um problema ao iniciar a máquina. Por favor, contate um administrador.');
        }
        
        toast.success('Pagamento aprovado! Sua máquina foi liberada.');
        return true;
      } else {
        toast.error('Pagamento rejeitado pela operadora.');
        throw new Error('Pagamento rejeitado pela operadora');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento PayGo:', error);
      toast.error(`Erro ao processar pagamento: ${error.message}`);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelPaygoTefPayment = async (
    transactionId: string,
    machineId: string,
    laundryId: string
  ) => {
    try {
      setIsProcessing(true);
      const response = await cancelPaygoPayment({
        transactionId,
        machineId,
        laundryId,
        printReceipt: true
      });

      if (response.status === 'approved') {
        toast.success('Pagamento cancelado com sucesso');
        return true;
      } else {
        toast.error(`Erro ao cancelar pagamento: ${response.message}`);
        return false;
      }
    } catch (error) {
      console.error('Erro ao cancelar pagamento:', error);
      toast.error(`Erro ao cancelar pagamento: ${error.message}`);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const checkDeviceStatus = async (laundryId: string) => {
    try {
      const status = await checkPaygoDeviceStatus(laundryId);
      setDeviceStatus(status);
      return status;
    } catch (error) {
      console.error('Erro ao verificar status do dispositivo:', error);
      return { isConnected: false, message: error.message };
    }
  };

  return {
    processPaygoTefPayment,
    cancelPaygoTefPayment,
    checkDeviceStatus,
    deviceStatus,
    isProcessing
  };
}
