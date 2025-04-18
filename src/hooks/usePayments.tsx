
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Payment } from "@/types";

// Type for payment data as it exists in the Supabase database
interface PaymentDB {
  id: string;
  machine_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  method: 'credit' | 'debit' | 'pix';
  user_id: string;
  created_at: string;
  transaction_id?: string;
}

// Convert database payment to application payment
const convertToPayment = (dbPayment: PaymentDB): Payment => ({
  id: dbPayment.id,
  machine_id: dbPayment.machine_id,
  amount: dbPayment.amount,
  status: dbPayment.status,
  method: dbPayment.method,
  user_id: dbPayment.user_id,
  created_at: new Date(dbPayment.created_at),
  transaction_id: dbPayment.transaction_id
});

export const usePayments = (laundryId?: string) => {
  return useQuery({
    queryKey: ['payments', laundryId],
    queryFn: async () => {
      try {
        const query = supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false });

        if (laundryId) {
          query.eq('laundry_id', laundryId);
        }

        const { data, error } = await query;
        if (error) throw error;
        
        // Convert created_at strings to Date objects
        return (data || []).map(payment => convertToPayment(payment as PaymentDB));
      } catch (error) {
        console.error("Error fetching payments:", error);
        return [];
      }
    },
    enabled: true // Replace the problematic condition with a simple boolean value
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: Omit<Payment, "id" | "created_at">) => {
      // Create a payment object compatible with the database schema
      const paymentForDB = {
        machine_id: payment.machine_id,
        amount: payment.amount,
        status: payment.status,
        method: payment.method,
        user_id: payment.user_id,
        transaction_id: payment.transaction_id
      };
      
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentForDB)
        .select()
        .single();

      if (error) throw error;
      return convertToPayment(data as PaymentDB);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pagamento registrado com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao registrar pagamento: ' + error.message);
    }
  });
};
