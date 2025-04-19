
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

// Update this interface to make properties optional
interface UpdatePaymentSettingsData {
  access_token?: string;
  public_key?: string;
  integration_id?: string;
  sandbox_mode?: boolean;
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
      const updateData: UpdatePaymentSettingsData = {};
      
      // Only include properties that are defined
      if (newSettings.access_token !== undefined) updateData.access_token = newSettings.access_token;
      if (newSettings.public_key !== undefined) updateData.public_key = newSettings.public_key;
      if (newSettings.integration_id !== undefined) updateData.integration_id = newSettings.integration_id;
      if (newSettings.sandbox_mode !== undefined) updateData.sandbox_mode = newSettings.sandbox_mode;
      
      const { error } = await supabase
        .from('payment_settings')
        .update(updateData)
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
