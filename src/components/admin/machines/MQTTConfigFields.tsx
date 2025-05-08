
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { MachineFormValues } from "./machine-form-schema";
import { Network } from "lucide-react";

interface MQTTConfigFieldsProps {
  form: UseFormReturn<MachineFormValues>;
}

export function MQTTConfigFields({ form }: MQTTConfigFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Network className="h-4 w-4" />
        <h3 className="text-sm font-medium">Configuração MQTT</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="mqtt_broker"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Broker MQTT</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder="ex: broker.hivemq.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mqtt_username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuário MQTT</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder="Usuário do broker" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="mqtt_password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Senha MQTT</FormLabel>
            <FormControl>
              <Input 
                type="password" 
                {...field} 
                value={field.value || ''} 
                placeholder="Senha do broker"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
