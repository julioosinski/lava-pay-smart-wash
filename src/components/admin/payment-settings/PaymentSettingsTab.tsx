
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { usePaymentSettings } from "@/hooks/admin/usePaymentSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Banknote } from "lucide-react";

const mercadoPagoSchema = z.object({
  access_token: z.string().min(1, "Token de acesso é obrigatório"),
  public_key: z.string().min(1, "Chave pública é obrigatória"),
  integration_id: z.string().min(1, "ID de integração é obrigatório"),
  sandbox_mode: z.boolean()
});

const elginSchema = z.object({
  client_id: z.string().min(1, "Client ID é obrigatório"),
  client_secret: z.string().min(1, "Client Secret é obrigatório"),
  merchant_name: z.string().min(1, "Nome do estabelecimento é obrigatório"),
  sandbox_mode: z.boolean()
});

type MercadoPagoForm = z.infer<typeof mercadoPagoSchema>;
type ElginForm = z.infer<typeof elginSchema>;

interface PaymentSettingsTabProps {
  laundryId: string;
}

export function PaymentSettingsTab({ laundryId }: PaymentSettingsTabProps) {
  const { settings, isLoading, updateSettings } = usePaymentSettings(laundryId);
  const [activeProvider, setActiveProvider] = useState<string>("mercado_pago");
  
  const mercadoPagoForm = useForm<MercadoPagoForm>({
    resolver: zodResolver(mercadoPagoSchema),
    defaultValues: {
      access_token: "",
      public_key: "",
      integration_id: "",
      sandbox_mode: true
    }
  });

  const elginForm = useForm<ElginForm>({
    resolver: zodResolver(elginSchema),
    defaultValues: {
      client_id: "",
      client_secret: "",
      merchant_name: "",
      sandbox_mode: true
    }
  });

  useEffect(() => {
    if (settings) {
      setActiveProvider(settings.provider || "mercado_pago");
      
      // Populate MercadoPago form
      mercadoPagoForm.reset({
        access_token: settings.access_token || "",
        public_key: settings.public_key || "",
        integration_id: settings.integration_id || "",
        sandbox_mode: settings.sandbox_mode
      });
      
      // Populate Elgin form
      elginForm.reset({
        client_id: settings.client_id || "",
        client_secret: settings.client_secret || "",
        merchant_name: settings.merchant_name || "",
        sandbox_mode: settings.sandbox_mode
      });
    }
  }, [settings, mercadoPagoForm, elginForm]);

  const onSubmitMercadoPago = async (data: MercadoPagoForm) => {
    try {
      await updateSettings({
        provider: "mercado_pago",
        ...data
      });
    } catch (error) {
      console.error("Erro ao atualizar configurações MercadoPago:", error);
    }
  };

  const onSubmitElgin = async (data: ElginForm) => {
    try {
      await updateSettings({
        provider: "elgin_tef",
        ...data
      });
    } catch (error) {
      console.error("Erro ao atualizar configurações Elgin:", error);
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
          Configure as credenciais dos provedores de pagamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeProvider} onValueChange={setActiveProvider}>
          <TabsList className="mb-6">
            <TabsTrigger value="mercado_pago" className="flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              MercadoPago
            </TabsTrigger>
            <TabsTrigger value="elgin_tef" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Elgin TEF
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mercado_pago">
            <Form {...mercadoPagoForm}>
              <form onSubmit={mercadoPagoForm.handleSubmit(onSubmitMercadoPago)} className="space-y-6">
                <FormField
                  control={mercadoPagoForm.control}
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
                  control={mercadoPagoForm.control}
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
                  control={mercadoPagoForm.control}
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
                  control={mercadoPagoForm.control}
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

                <Button type="submit">Salvar Configurações MercadoPago</Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="elgin_tef">
            <Form {...elginForm}>
              <form onSubmit={elginForm.handleSubmit(onSubmitElgin)} className="space-y-6">
                <FormField
                  control={elginForm.control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client ID</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" placeholder="Digite o Client ID da Elgin" />
                      </FormControl>
                      <FormDescription>
                        O Client ID é fornecido pela Elgin após aprovação do seu cadastro
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={elginForm.control}
                  name="client_secret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Secret</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" placeholder="Digite o Client Secret da Elgin" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={elginForm.control}
                  name="merchant_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Estabelecimento</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Digite o nome do estabelecimento que aparecerá nos recibos" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={elginForm.control}
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

                <Button type="submit">Salvar Configurações Elgin</Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
