
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateMachine } from "@/hooks/useMachines";
import { Plus } from "lucide-react";

// Define schema for form validation
const machineSchema = z.object({
  type: z.enum(["washer", "dryer"], {
    required_error: "Você precisa selecionar um tipo de máquina",
  }),
  price: z.coerce.number().positive({ message: "O preço deve ser maior que zero" }),
  time_minutes: z.coerce.number().int().positive({ message: "O tempo deve ser maior que zero" })
});

type MachineFormValues = z.infer<typeof machineSchema>;

export function MachineForm({ laundryId }: { laundryId: string }) {
  const [open, setOpen] = useState(false);
  const createMachine = useCreateMachine();

  // Create form with react-hook-form and zod validation
  const form = useForm<MachineFormValues>({
    resolver: zodResolver(machineSchema),
    defaultValues: {
      price: 0,
      time_minutes: 0
    }
  });

  const onSubmit = async (data: MachineFormValues) => {
    try {
      console.log("Submitting machine data:", { ...data, laundry_id: laundryId });
      await createMachine.mutateAsync({
        type: data.type,
        price: data.price,
        laundry_id: laundryId,
        time_minutes: data.time_minutes
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error creating machine:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex gap-2 items-center">
          <Plus className="h-4 w-4" /> Nova Máquina
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Nova Máquina</DialogTitle>
          <DialogDescription>
            Preencha os dados para adicionar uma nova máquina à lavanderia.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="washer">Lavadora</SelectItem>
                      <SelectItem value="dryer">Secadora</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo (minutos)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={createMachine.isPending}
            >
              {createMachine.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
