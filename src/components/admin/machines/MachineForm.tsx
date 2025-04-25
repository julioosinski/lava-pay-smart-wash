
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
      mqtt_broker: machine.mqtt_broker,
      mqtt_username: machine.mqtt_username,
      mqtt_password: machine.mqtt_password,
      wifi_ssid: machine.wifi_ssid,
      wifi_password: machine.wifi_password
    } : {
      price: 0,
      time_minutes: 0,
      machine_number: nextMachineNumber,
      mqtt_broker: "",
      mqtt_username: "",
      mqtt_password: "",
      wifi_ssid: "",
      wifi_password: ""
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
          mqtt_broker: data.mqtt_broker,
          mqtt_username: data.mqtt_username,
          mqtt_password: data.mqtt_password,
          wifi_ssid: data.wifi_ssid,
          wifi_password: data.wifi_password
        });
      } else {
        await createMachine.mutateAsync({
          type: data.type,
          price: data.price,
          laundry_id: laundryId,
          time_minutes: data.time_minutes,
          machine_number: data.machine_number,
          mqtt_broker: data.mqtt_broker,
          mqtt_username: data.mqtt_username,
          mqtt_password: data.mqtt_password,
          wifi_ssid: data.wifi_ssid,
          wifi_password: data.wifi_password
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
      <DialogContent className="w-[95%] max-w-lg max-h-[90vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">
            {variant === "edit" ? "Editar Máquina" : "Adicionar Nova Máquina"}
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            {variant === "edit" 
              ? "Atualize os dados da máquina."
              : "Preencha os dados para adicionar uma nova máquina à lavanderia."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MachineTypeField form={form} />
              <MachineNumberField form={form} />
            </div>
            <MachineDetailsFields 
              form={form} 
              machineId={machine?.id}
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
