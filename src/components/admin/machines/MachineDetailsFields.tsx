
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { MachineFormValues } from "./machine-form-schema";

interface MachineDetailsFieldsProps {
  form: UseFormReturn<MachineFormValues>;
}

export function MachineDetailsFields({ form }: MachineDetailsFieldsProps) {
  return (
    <>
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

      <div className="space-y-4 border-t pt-4 mt-4">
        <h3 className="font-medium text-sm">Credenciais das Operadoras</h3>
        
        <FormField
          control={form.control}
          name="stone_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código Stone</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Opcional" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stone_terminal_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID do Terminal Stone</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Opcional" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="elgin_terminal_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID do Terminal Elgin</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Opcional" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mercadopago_terminal_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID do Terminal MercadoPago</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Opcional" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
