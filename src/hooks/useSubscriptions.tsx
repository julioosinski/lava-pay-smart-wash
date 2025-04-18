
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Subscription } from "@/types";

// Type for subscription data as it exists in the Supabase database
interface SubscriptionDB {
  id: string;
  laundry_id: string;
  amount: number;
  billing_day: number;
  next_billing_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Convert database subscription to application subscription
const convertToSubscription = (dbSubscription: SubscriptionDB): Subscription => ({
  id: dbSubscription.id,
  laundry_id: dbSubscription.laundry_id,
  amount: dbSubscription.amount,
  billing_day: dbSubscription.billing_day,
  next_billing_date: dbSubscription.next_billing_date,
  status: dbSubscription.status,
  created_at: dbSubscription.created_at,
  updated_at: dbSubscription.updated_at
});

export const useSubscriptions = (laundryId?: string) => {
  return useQuery({
    queryKey: ['subscriptions', laundryId],
    queryFn: async () => {
      try {
        const query = supabase
          .from('subscriptions')
          .select('*')
          .order('created_at', { ascending: false });

        if (laundryId) {
          query.eq('laundry_id', laundryId);
        }

        const { data, error } = await query;
        if (error) throw error;
        
        return (data || []).map(subscription => 
          convertToSubscription(subscription as SubscriptionDB)
        );
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
        return [];
      }
    },
    enabled: true
  });
};

// Type for creating a new subscription
type SubscriptionInput = {
  laundry_id: string;
  amount: number;
  billing_day: number;
  next_billing_date: string;
  status?: string;
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscription: SubscriptionInput) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert(subscription)
        .select()
        .single();

      if (error) throw error;
      return convertToSubscription(data as SubscriptionDB);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Assinatura registrada com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao registrar assinatura: ' + error.message);
    }
  });
};
