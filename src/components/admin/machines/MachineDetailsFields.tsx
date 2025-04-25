
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { MachineFormValues } from "./machine-form-schema";
import { ESP32ConfigFields } from "./ESP32ConfigFields";
import { MQTTConfigFields } from "./MQTTConfigFields";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MachineDetailsFieldsProps {
  form: UseFormReturn<MachineFormValues>;
  machineId?: string;
}

export function MachineDetailsFields({ form, machineId }: MachineDetailsFieldsProps) {
  return (
    <div className="space-y-6">
      {machineId && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-2">
            ID da Máquina: <code className="px-2 py-1 bg-muted rounded">{machineId}</code>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
      </div>

      <MQTTConfigFields form={form} />
      <ESP32ConfigFields form={form} />
    </div>
  );
}
