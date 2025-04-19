
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createBusinessOwner } from "@/services/businessOwner";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface UserFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone precisa ter pelo menos 10 dígitos"),
});

type FormValues = z.infer<typeof formSchema>;

export function UserForm({ onClose, onSuccess }: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      
      console.log("Criando proprietário:", values);
      
      // Criar conta de proprietário
      const result = await createBusinessOwner({
        name: values.name,
        email: values.email,
        phone: values.phone,
      });

      if (result.userId) {
        toast.success("Proprietário cadastrado com sucesso! Login com email e telefone como senha.");
        // Invalidar a query de proprietários para forçar uma nova busca
        await queryClient.invalidateQueries({ queryKey: ['business-owners'] });
        onSuccess();
      } else {
        throw new Error("Não foi possível criar o proprietário");
      }
    } catch (error) {
      console.error("Error creating business owner:", error);
      toast.error("Erro ao criar proprietário: " + 
        (error instanceof Error ? error.message : "Erro desconhecido"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Cadastrar Novo Proprietário</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            {...form.register("name")}
            className="mt-1"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            className="mt-1"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            {...form.register("phone")}
            className="mt-1"
          />
          {form.formState.errors.phone && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.phone.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
