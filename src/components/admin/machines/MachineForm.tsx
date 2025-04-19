
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Plus, PencilLine } from "lucide-react";
import { useCreateMachine, useUpdateMachine, useMachines } from "@/hooks/useMachines";
import { Machine } from "@/types";
import { machineSchema, type MachineFormValues } from "./machine-form-schema";
import { MachineTypeField } from "./MachineTypeField";
import { MachineNumberField } from "./MachineNumberField";
import { MachineDetailsFields } from "./MachineDetailsFields";

interface MachineFormProps {
  laundryId: string;
  machine?: Machine;
  variant?: "create" | "edit";
  triggerElement?: React.ReactNode;
  onSuccess?: () => void;
}

export function MachineForm({ laundryId, machine, variant = "create", triggerElement, onSuccess }: MachineFormProps) {
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
          type: data.type,
          price: data.price,
          time_minutes: data.time_minutes,
          machine_number: data.machine_number,
          store_id: data.store_id,
          machine_serial: data.machine_serial
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
      onSuccess?.();
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
            <MachineTypeField form={form} />
            <MachineNumberField form={form} />
            <MachineDetailsFields form={form} />

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
