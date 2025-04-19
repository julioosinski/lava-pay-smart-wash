
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentSettings {
  id: string;
  provider: string;
  access_token: string | null;
  public_key: string | null;
  integration_id: string | null;
  sandbox_mode: boolean;
}

interface UpdatePaymentSettingsData {
  access_token: string;
  public_key: string;
  integration_id: string;
  sandbox_mode: boolean;
}

export function usePaymentSettings() {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .single();

      if (error) {
        console.error("Erro ao buscar configurações de pagamento:", error);
        throw error;
      }

      return data as PaymentSettings;
    }
  });

  const updateSettings = async (newSettings: UpdatePaymentSettingsData) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('payment_settings')
        .update({
          access_token: newSettings.access_token,
          public_key: newSettings.public_key,
          integration_id: newSettings.integration_id,
          sandbox_mode: newSettings.sandbox_mode
        })
        .eq('provider', 'mercado_pago');

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    settings,
    isLoading: isLoading || isUpdating,
    updateSettings
  };
}
