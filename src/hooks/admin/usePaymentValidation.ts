
import * as z from "zod";
import { MercadoPagoSettings, ElginSettings } from "@/types/payment-settings";

const baseSchema = {
  sandbox_mode: z.boolean()
};

export const mercadoPagoSchema = z.object({
  access_token: z.string().min(1, "Token de acesso é obrigatório"),
  public_key: z.string().min(1, "Chave pública é obrigatória"),
  integration_id: z.string().min(1, "ID de integração é obrigatório"),
  ...baseSchema
});

export const elginSchema = z.object({
  client_id: z.string().min(1, "Client ID é obrigatório"),
  client_secret: z.string().min(1, "Client Secret é obrigatório"),
  merchant_name: z.string().min(1, "Nome do estabelecimento é obrigatório"),
  ...baseSchema
});

export function usePaymentValidation() {
  return {
    mercadoPagoSchema,
    elginSchema
  };
}

export type MercadoPagoForm = z.infer<typeof mercadoPagoSchema>;
export type ElginForm = z.infer<typeof elginSchema>;
