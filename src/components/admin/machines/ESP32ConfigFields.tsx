
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { MachineFormValues } from "./machine-form-schema";
import { Wifi } from "lucide-react";

interface ESP32ConfigFieldsProps {
  form: UseFormReturn<MachineFormValues>;
}

export function ESP32ConfigFields({ form }: ESP32ConfigFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Wifi className="h-4 w-4" />
        <h3 className="text-sm font-medium">Configuração do ESP32</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="wifi_ssid"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Rede WiFi</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder="Nome da rede" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="wifi_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha do WiFi</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  {...field} 
                  value={field.value || ''} 
                  placeholder="Senha da rede"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="mqtt_broker"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Broker MQTT</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder="Endereço do broker" />
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
