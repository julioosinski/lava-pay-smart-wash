
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BusinessOwner {
  id: string;
  name?: string;
  email?: string;
}

interface LaundryFormContentProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (values: FormValues) => void;
  mode: "create" | "edit";
  isLoading: boolean;
  businessOwners?: BusinessOwner[];
}

export function LaundryFormContent({ form, onSubmit, mode, isLoading, businessOwners = [] }: LaundryFormContentProps) {
  // Debug para ver se estamos recebendo proprietários
  console.log("LaundryFormContent - businessOwners:", businessOwners);
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Lavanderia</FormLabel>
              <FormControl>
                <Input placeholder="Nome da lavanderia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input placeholder="Rua, número, complemento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="owner_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proprietário</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={businessOwners.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um proprietário" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessOwners.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Nenhum proprietário disponível
                      </SelectItem>
                    ) : (
                      businessOwners.map((owner) => (
                        <SelectItem key={owner.id} value={owner.id}>
                          {owner.name || owner.email || owner.id}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email de Contato</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone de Contato</FormLabel>
              <FormControl>
                <Input placeholder="(99) 99999-9999" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : mode === "create" ? "Criar" : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
