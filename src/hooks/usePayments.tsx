
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Payment } from "@/types";

// Type for payment data as it exists in the Supabase database
type PaymentDB = Omit<Payment, "created_at"> & {
  created_at: string;
};

// Convert database payment to application payment
const convertToPayment = (dbPayment: PaymentDB): Payment => ({
  ...dbPayment,
  created_at: new Date(dbPayment.created_at)
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
    enabled: !laundryId || !!laundryId
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: Omit<Payment, "id" | "created_at"> & { created_at?: string }) => {
      // Omit the created_at property as Supabase will set it automatically with the default value
      const { created_at, ...paymentData } = payment;
      
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
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
