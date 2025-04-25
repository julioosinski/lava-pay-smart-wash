
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
  client_id?: string | null;
  client_secret?: string | null;
  merchant_name?: string | null;
  terminal_serial?: string | null;
  terminal_model?: string | null;
  stone_code?: string | null;
}

interface UpdatePaymentSettingsData {
  access_token?: string;
  public_key?: string;
  integration_id?: string;
  sandbox_mode?: boolean;
  client_id?: string;
  client_secret?: string;
  merchant_name?: string;
  provider?: string;
  terminal_serial?: string;
  terminal_model?: string;
  stone_code?: string;
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
      
      // Campos comuns
      if (newSettings.sandbox_mode !== undefined) updateData.sandbox_mode = newSettings.sandbox_mode;
      if (newSettings.merchant_name !== undefined) updateData.merchant_name = newSettings.merchant_name;
      if (newSettings.provider !== undefined) updateData.provider = newSettings.provider;
      if (newSettings.terminal_serial !== undefined) updateData.terminal_serial = newSettings.terminal_serial;
      if (newSettings.terminal_model !== undefined) updateData.terminal_model = newSettings.terminal_model;
      
      // Campos específicos do MercadoPago
      if (newSettings.access_token !== undefined) updateData.access_token = newSettings.access_token;
      if (newSettings.public_key !== undefined) updateData.public_key = newSettings.public_key;
      if (newSettings.integration_id !== undefined) updateData.integration_id = newSettings.integration_id;
      
      // Campos específicos da Elgin
      if (newSettings.client_id !== undefined) updateData.client_id = newSettings.client_id;
      if (newSettings.client_secret !== undefined) updateData.client_secret = newSettings.client_secret;
      
      // Campos específicos da Stone
      if (newSettings.stone_code !== undefined) updateData.stone_code = newSettings.stone_code;
      
      if (settings?.id) {
        // Atualizar configurações existentes
        const { error } = await supabase
          .from('payment_settings')
          .update(updateData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Criar novas configurações
        // Define o provider padrão como 'elgin_tef' se não for especificado
        if (!updateData.provider) {
          updateData.provider = 'elgin_tef';
        }

        const { error } = await supabase
          .from('payment_settings')
          .insert([{
            ...updateData,
            laundry_id: laundryId
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
