
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentSettings {
  id: string;
  laundry_id: string;
  provider: string;
  access_token: string | null;
  public_key: string | null;
  integration_id: string | null;
  sandbox_mode: boolean;
}

interface UpdatePaymentSettingsData {
  access_token?: string;
  public_key?: string;
  integration_id?: string;
  sandbox_mode?: boolean;
}

export function usePaymentSettings(laundryId: string) {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['payment-settings', laundryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('laundry_id', laundryId)
        .eq('provider', 'mercado_pago')
        .maybeSingle();

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
      
      if (newSettings.access_token !== undefined) updateData.access_token = newSettings.access_token;
      if (newSettings.public_key !== undefined) updateData.public_key = newSettings.public_key;
      if (newSettings.integration_id !== undefined) updateData.integration_id = newSettings.integration_id;
      if (newSettings.sandbox_mode !== undefined) updateData.sandbox_mode = newSettings.sandbox_mode;
      
      if (settings?.id) {
        // Atualizar configurações existentes
        const { error } = await supabase
          .from('payment_settings')
          .update(updateData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Criar novas configurações
        const { error } = await supabase
          .from('payment_settings')
          .insert([{
            ...updateData,
            laundry_id: laundryId,
            provider: 'mercado_pago'
          }]);

        if (error) throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ['payment-settings', laundryId] });
      toast.success("Configurações de pagamento atualizadas com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error);
      toast.error("Erro ao atualizar configurações de pagamento");
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
