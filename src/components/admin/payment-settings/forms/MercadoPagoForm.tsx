import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { usePaymentValidation, MercadoPagoForm as IMercadoPagoForm } from "@/hooks/admin/usePaymentValidation";
import { MercadoPagoSettings } from "@/types/payment-settings";

interface MercadoPagoFormProps {
  initialData?: Partial<MercadoPagoSettings>;
  onSubmit: (data: IMercadoPagoForm) => Promise<void>;
}

export function MercadoPagoForm({ initialData, onSubmit }: MercadoPagoFormProps) {
  const { mercadoPagoSchema } = usePaymentValidation();
  const form = useForm<IMercadoPagoForm>({
    resolver: zodResolver(mercadoPagoSchema),
    defaultValues: {
      access_token: initialData?.access_token || "",
      public_key: initialData?.public_key || "",
      integration_id: initialData?.integration_id || "",
      sandbox_mode: initialData?.sandbox_mode ?? true
    }
  });

  return (
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

        <Button type="submit">Salvar Configurações MercadoPago</Button>
      </form>
    </Form>
  );
}
