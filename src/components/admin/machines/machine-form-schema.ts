
import { z } from "zod";

export const machineSchema = z.object({
  type: z.enum(["washer", "dryer"], {
    required_error: "Você precisa selecionar um tipo de máquina",
  }),
  price: z.coerce.number().positive({ message: "O preço deve ser maior que zero" }),
  time_minutes: z.coerce.number().int().positive({ message: "O tempo deve ser maior que zero" }),
  machine_number: z.coerce.number().int().positive({ message: "O número da máquina deve ser maior que zero" }),
  store_id: z.string().min(1, { message: "ID da loja é obrigatório" }),
  machine_serial: z.string().min(1, { message: "Número serial da máquina é obrigatório" }),
  
  // MQTT Configuration
  mqtt_broker: z.string().optional(),
  mqtt_username: z.string().optional(),
  mqtt_password: z.string().optional(),
  
  // ESP32 Configuration - all fields are optional
  wifi_ssid: z.string().optional(),
  wifi_password: z.string().optional(),
});

export type MachineFormValues = z.infer<typeof machineSchema>;
