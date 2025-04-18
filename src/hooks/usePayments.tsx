
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Payment } from "@/types";

export const usePayments = (laundryId?: string) => {
  return useQuery({
    queryKey: ['payments', laundryId],
    queryFn: async () => {
      // For now, use mock data as we need to set up the server-side
      // In a real application, we would fetch from Supabase
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
        const formattedPayments = data?.map(payment => ({
          ...payment,
          created_at: new Date(payment.created_at)
        })) || [];
        
        return formattedPayments as Payment[];
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
    mutationFn: async (payment: Omit<Payment, 'id'>) => {
      const { data, error } = await supabase
        .from('payments')
        .insert(payment)
        .select()
        .single();

      if (error) throw error;
      return data as Payment;
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
