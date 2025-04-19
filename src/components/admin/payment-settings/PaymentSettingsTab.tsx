
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { usePaymentSettings } from "@/hooks/admin/usePaymentSettings";

const paymentSettingsSchema = z.object({
  access_token: z.string().min(1, "Token de acesso é obrigatório"),
  public_key: z.string().min(1, "Chave pública é obrigatória"),
  integration_id: z.string().min(1, "ID de integração é obrigatório"),
  sandbox_mode: z.boolean()
});

type PaymentSettingsForm = z.infer<typeof paymentSettingsSchema>;

interface PaymentSettingsTabProps {
  laundryId: string;
}

export function PaymentSettingsTab({ laundryId }: PaymentSettingsTabProps) {
  const { settings, isLoading, updateSettings } = usePaymentSettings(laundryId);
  
  const form = useForm<PaymentSettingsForm>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      access_token: "",
      public_key: "",
      integration_id: "",
      sandbox_mode: true
    }
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        access_token: settings.access_token || "",
        public_key: settings.public_key || "",
        integration_id: settings.integration_id || "",
        sandbox_mode: settings.sandbox_mode
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: PaymentSettingsForm) => {
    try {
      await updateSettings(data);
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error);
    }
  };

  if (isLoading) {
    return <div className="p-4">Carregando configurações...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Pagamento</CardTitle>
        <CardDescription>
          Configure as credenciais do MercadoPago para processar pagamentos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="access_token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token de Acesso</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="Digite o token de acesso do MercadoPago" />
                  </FormControl>
                  <FormDescription>
                    O token de acesso pode ser encontrado no painel do MercadoPago
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="public_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave Pública</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite a chave pública do MercadoPago" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="integration_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID de Integração</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite o ID de integração do MercadoPago" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sandbox_mode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Modo Sandbox</FormLabel>
                    <FormDescription>
                      Ative para testar pagamentos em ambiente de desenvolvimento
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit">Salvar Configurações</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
