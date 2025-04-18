
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateSubscription } from "@/hooks/useSubscriptions";
import { Plus } from "lucide-react";
import { format } from "date-fns";

// Define schema for form validation
const subscriptionSchema = z.object({
  amount: z.coerce.number().positive({ message: "O valor deve ser maior que zero" }),
  billing_day: z.coerce.number().int().min(1, { message: "Dia deve ser entre 1 e 28" }).max(28, { message: "Dia deve ser entre 1 e 28" }),
  next_billing_date: z.string().min(1, { message: "Data obrigatória" })
});

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

export function SubscriptionForm({ laundryId }: { laundryId: string }) {
  const [open, setOpen] = useState(false);
  const createSubscription = useCreateSubscription();
  const today = new Date();
  const defaultNextBillingDate = format(today, 'yyyy-MM-dd');

  // Create form with react-hook-form and zod validation
  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      amount: 0,
      billing_day: 10,
      next_billing_date: defaultNextBillingDate
    }
  });

  const onSubmit = async (data: SubscriptionFormValues) => {
    try {
      console.log("Submitting subscription data:", { ...data, laundry_id: laundryId });
      await createSubscription.mutateAsync({
        amount: data.amount,
        billing_day: data.billing_day,
        next_billing_date: data.next_billing_date,
        laundry_id: laundryId,
        status: 'active'
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error creating subscription:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex gap-2 items-center">
          <Plus className="h-4 w-4" /> Nova Mensalidade
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Mensalidade</DialogTitle>
          <DialogDescription>
            Configure a mensalidade para esta lavanderia.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billing_day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dia de cobrança (1-28)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="28" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="next_billing_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Próxima cobrança</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={createSubscription.isPending}
            >
              {createSubscription.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
