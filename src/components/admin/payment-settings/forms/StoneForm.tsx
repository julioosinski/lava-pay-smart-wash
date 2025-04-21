
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { usePaymentValidation, StoneForm as IStoneForm } from "@/hooks/admin/usePaymentValidation";
import { StoneSettings } from "@/types/payment-settings";

interface StoneFormProps {
  initialData?: Partial<StoneSettings>;
  onSubmit: (data: IStoneForm) => Promise<void>;
}

export function StoneForm({ initialData, onSubmit }: StoneFormProps) {
  const { stoneSchema } = usePaymentValidation();
  const form = useForm<IStoneForm>({
    resolver: zodResolver(stoneSchema),
    defaultValues: {
      stone_code: initialData?.stone_code || "",
      merchant_name: initialData?.merchant_name || "",
      sandbox_mode: initialData?.sandbox_mode ?? true
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="stone_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código Stone</FormLabel>
              <FormControl>
                <Input {...field} type="text" placeholder="Digite o código da Stone" />
              </FormControl>
              <FormDescription>
                O código é fornecido pela Stone após aprovação do seu cadastro
              </FormDescription>
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

        <Button type="submit">Salvar Configurações Stone</Button>
      </form>
    </Form>
  );
}
