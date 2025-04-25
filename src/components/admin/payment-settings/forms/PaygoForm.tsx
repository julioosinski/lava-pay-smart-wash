
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentSettings } from "@/types/payment-settings";

const paygoSchema = z.object({
  paygo_client_id: z.string().min(1, "Client ID é obrigatório"),
  paygo_client_secret: z.string().min(1, "Client Secret é obrigatório"),
  paygo_terminal_id: z.string().min(1, "Terminal ID é obrigatório"),
  paygo_merchant_id: z.string().min(1, "Merchant ID é obrigatório"),
  merchant_name: z.string().min(1, "Nome do estabelecimento é obrigatório"),
  sandbox_mode: z.boolean(),
});

type PaygoFormValues = z.infer<typeof paygoSchema>;

interface PaygoFormProps {
  initialData: PaymentSettings | null;
  onSubmit: (data: PaygoFormValues) => void;
}

export function PaygoForm({ initialData, onSubmit }: PaygoFormProps) {
  const form = useForm<PaygoFormValues>({
    resolver: zodResolver(paygoSchema),
    defaultValues: {
      paygo_client_id: initialData?.paygo_client_id || '',
      paygo_client_secret: initialData?.paygo_client_secret || '',
      paygo_terminal_id: initialData?.paygo_terminal_id || '',
      paygo_merchant_id: initialData?.paygo_merchant_id || '',
      merchant_name: initialData?.merchant_name || '',
      sandbox_mode: initialData?.sandbox_mode ?? true,
    },
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="paygo_client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client ID</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite o Client ID do PayGo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paygo_client_secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Secret</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="password"
                      placeholder="Digite o Client Secret do PayGo" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paygo_terminal_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terminal ID</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite o ID do Terminal" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paygo_merchant_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Merchant ID</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite o ID do Lojista" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="merchant_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Estabelecimento</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite o nome do estabelecimento" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sandbox_mode"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Modo Sandbox</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Salvar Configurações
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
