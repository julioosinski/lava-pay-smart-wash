
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const elginSchema = z.object({
  client_id: z.string().min(1, "Client ID é obrigatório"),
  client_secret: z.string().min(1, "Client Secret é obrigatório"),
  merchant_name: z.string().min(1, "Nome do estabelecimento é obrigatório"),
  sandbox_mode: z.boolean()
});

type ElginForm = z.infer<typeof elginSchema>;

interface ElginFormProps {
  initialData?: Partial<ElginForm>;
  onSubmit: (data: ElginForm) => Promise<void>;
}

export function ElginForm({ initialData, onSubmit }: ElginFormProps) {
  const form = useForm<ElginForm>({
    resolver: zodResolver(elginSchema),
    defaultValues: {
      client_id: initialData?.client_id || "",
      client_secret: initialData?.client_secret || "",
      merchant_name: initialData?.merchant_name || "",
      sandbox_mode: initialData?.sandbox_mode ?? true
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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

        <Button type="submit">Salvar Configurações Elgin</Button>
      </form>
    </Form>
  );
}
