
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateMachine, useUpdateMachine, useMachines } from "@/hooks/useMachines";
import { Plus, PencilLine } from "lucide-react";
import { Machine } from "@/types";

const machineSchema = z.object({
  type: z.enum(["washer", "dryer"], {
    required_error: "Você precisa selecionar um tipo de máquina",
  }),
  price: z.coerce.number().positive({ message: "O preço deve ser maior que zero" }),
  time_minutes: z.coerce.number().int().positive({ message: "O tempo deve ser maior que zero" }),
  machine_number: z.coerce.number().int().positive({ message: "O número da máquina deve ser maior que zero" }),
  store_id: z.string().min(1, { message: "ID da loja é obrigatório" }),
  machine_serial: z.string().min(1, { message: "Número serial da máquina é obrigatório" })
});

type MachineFormValues = z.infer<typeof machineSchema>;

interface MachineFormProps {
  laundryId: string;
  machine?: Machine;
  variant?: "create" | "edit";
  triggerElement?: React.ReactNode; // Add this prop to the interface
}

export function MachineForm({ laundryId, machine, variant = "create", triggerElement }: MachineFormProps) {
  const [open, setOpen] = useState(false);
  const createMachine = useCreateMachine();
  const updateMachine = useUpdateMachine();
  const { data: existingMachines = [] } = useMachines(laundryId);
  
  const nextMachineNumber = existingMachines.length > 0 
    ? Math.max(...existingMachines.map(m => m.machine_number || 0)) + 1 
    : 1;

  const form = useForm<MachineFormValues>({
    resolver: zodResolver(machineSchema),
    defaultValues: machine ? {
      type: machine.type,
      price: machine.price,
      time_minutes: machine.time_minutes,
      machine_number: machine.machine_number,
      store_id: machine.store_id,
      machine_serial: machine.machine_serial
    } : {
      price: 0,
      time_minutes: 0,
      machine_number: nextMachineNumber,
      store_id: `STORE-${nextMachineNumber}`,
      machine_serial: `SERIAL-${nextMachineNumber}`
    }
  });

  const onSubmit = async (data: MachineFormValues) => {
    try {
      if (variant === "edit" && machine) {
        await updateMachine.mutateAsync({
          id: machine.id,
          laundry_id: laundryId,
          ...data
        });
      } else {
        await createMachine.mutateAsync({
          type: data.type,
          price: data.price,
          laundry_id: laundryId,
          time_minutes: data.time_minutes,
          machine_number: data.machine_number,
          store_id: data.store_id,
          machine_serial: data.machine_serial
        });
      }
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error saving machine:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerElement ? (
          triggerElement
        ) : (
          <Button 
            variant={variant === "edit" ? "ghost" : "default"}
            size={variant === "edit" ? "icon" : "default"}
            className={variant === "create" ? "flex gap-2 items-center" : ""}
          >
            {variant === "edit" ? (
              <PencilLine className="h-4 w-4" />
            ) : (
              <>
                <Plus className="h-4 w-4" /> Nova Máquina
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {variant === "edit" ? "Editar Máquina" : "Adicionar Nova Máquina"}
          </DialogTitle>
          <DialogDescription>
            {variant === "edit" 
              ? "Atualize os dados da máquina."
              : "Preencha os dados para adicionar uma nova máquina à lavanderia."
            }
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
              name="machine_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número da Máquina</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="store_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID da Loja</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="machine_serial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número Serial da Máquina</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
              disabled={createMachine.isPending || updateMachine.isPending}
            >
              {(createMachine.isPending || updateMachine.isPending) ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
