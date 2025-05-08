
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { MachineFormValues } from "./machine-form-schema";

interface MachineNumberFieldProps {
  form: UseFormReturn<MachineFormValues>;
}

export function MachineNumberField({ form }: MachineNumberFieldProps) {
  return (
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
  );
}
