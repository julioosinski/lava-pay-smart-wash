
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createBusinessOwner, updateBusinessOwner } from "@/services/businessOwner";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { BusinessOwner } from "@/types";

interface UserFormProps {
  onClose: () => void;
  onSuccess: () => void;
  user?: BusinessOwner | null;
  mode?: "create" | "edit";
}

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone precisa ter pelo menos 10 dígitos"),
});

type FormValues = z.infer<typeof formSchema>;

export function UserForm({ onClose, onSuccess, user, mode = "create" }: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  // Atualizar valores do formulário quando o usuário muda
  useEffect(() => {
    if (user) {
      console.log("Atualizando formulário com os dados do usuário:", user);
      form.reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [form, user]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      
      console.log(`${mode === "create" ? "Criando" : "Atualizando"} proprietário:`, values);
      
      let result;
      
      // Garantimos que name é sempre uma string não vazia
      const ownerData = {
        name: values.name.trim(),
        email: values.email,
        phone: values.phone,
      };
      
      // Verificamos se o nome está vazio
      if (!ownerData.name) {
        toast.error("Nome é obrigatório");
        return;
      }
      
      if (mode === "edit" && user?.id) {
        // Atualizar proprietário existente
        console.log("Enviando dados para atualização:", user.id, ownerData);
        result = await updateBusinessOwner(user.id, ownerData);
      } else {
        // Criar novo proprietário
        result = await createBusinessOwner(ownerData);
      }

      if (result.userId) {
        toast.success(
          mode === "create" 
            ? "Proprietário cadastrado com sucesso! Se for novo usuário, o login será feito com email e telefone como senha."
            : "Proprietário atualizado com sucesso!"
        );
        
        // Invalidar a query de proprietários para forçar uma nova busca
        await queryClient.invalidateQueries({ queryKey: ['business-owners'] });
        
        // Aguardar um curto período antes de executar o callback de sucesso
        // para garantir que os dados tenham tempo de serem atualizados no servidor
        setTimeout(() => {
          onSuccess();
        }, 100); // Reduzir o timeout para ser mais rápido
      } else {
        throw new Error(result.error || `Não foi possível ${mode === "create" ? "criar" : "atualizar"} o proprietário`);
      }
    } catch (error) {
      console.error(`Error ${mode === "create" ? "creating" : "updating"} business owner:`, error);
      toast.error(`Erro ao processar proprietário: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">
        {mode === "create" ? "Cadastrar Novo Proprietário" : "Editar Proprietário"}
      </h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            {...form.register("name")}
            className="mt-1"
            required
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
            required
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
            required
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
            {isLoading ? "Salvando..." : (mode === "create" ? "Salvar" : "Atualizar")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
