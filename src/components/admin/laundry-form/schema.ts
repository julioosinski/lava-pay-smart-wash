
import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  contact_phone: z.string().min(1, "Telefone é obrigatório"),
  contact_email: z.string().email("Email inválido"),
  owner_id: z.string().min(1, "Proprietário é obrigatório"),
});

export type FormValues = z.infer<typeof formSchema>;
