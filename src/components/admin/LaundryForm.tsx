
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateLaundry, useUpdateLaundry } from "@/hooks/useLaundries";
import { LaundryLocation } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define the form schema outside of the component
const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  contact_phone: z.string().min(1, "Telefone é obrigatório"),
  contact_email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
});

// Define the form values type explicitly without using z.infer
type FormValues = {
  name: string;
  address: string;
  contact_phone: string;
  contact_email: string;
};

interface LaundryFormProps {
  initialData?: LaundryLocation;
  mode?: "create" | "edit";
}

export function LaundryForm({ initialData, mode = "create" }: LaundryFormProps) {
  const [open, setOpen] = useState(false);
  const createLaundry = useCreateLaundry();
  const updateLaundry = useUpdateLaundry();

  // Initialize the form with default values or initial data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      address: initialData.address,
      contact_phone: initialData.contact_phone || "",
      contact_email: initialData.contact_email || "",
    } : {
      name: "",
      address: "",
      contact_phone: "",
      contact_email: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      if (mode === "create") {
        // Primeiro, verifica se já existe um usuário com este email
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('contact_email', values.contact_email)
          .single();

        let userId;

        if (existingUser) {
          userId = existingUser.id;
        } else {
          // Cria um novo usuário com o email e telefone como senha
          const { data: newUser, error: signUpError } = await supabase.auth.signUp({
            email: values.contact_email,
            password: values.contact_phone.replace(/\D/g, ''), // Remove caracteres não numéricos
            options: {
              data: {
                role: 'business'
              }
            }
          });

          if (signUpError) {
            console.error("Error creating user:", signUpError);
            toast.error("Erro ao criar usuário");
            return;
          }

          userId = newUser.user?.id;

          // Atualiza o perfil do usuário com o papel de business
          if (userId) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ 
                role: 'business',
                contact_email: values.contact_email,
                contact_phone: values.contact_phone
              })
              .eq('id', userId);

            if (updateError) {
              console.error("Error updating user profile:", updateError);
            }
          }
        }

        // Cria a lavanderia com o owner_id definido
        const laundryData = {
          name: values.name,
          address: values.address,
          contact_phone: values.contact_phone,
          contact_email: values.contact_email,
          owner_id: userId
        };
        
        await createLaundry.mutateAsync(laundryData);
        setOpen(false);
        form.reset();

        toast.success("Lavanderia criada com sucesso! O proprietário pode fazer login usando o email e o telefone como senha.");
      } else if (initialData?.id) {
        // For update, ensure we're sending all required fields with their values
        await updateLaundry.mutateAsync({
          id: initialData.id,
          name: values.name,
          address: values.address,
          contact_phone: values.contact_phone,
          contact_email: values.contact_email
        });
      }
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Input {...field} />
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
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input {...field} required />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={createLaundry.isPending || updateLaundry.isPending}
        >
          {mode === "create" ? "Criar Lavanderia" : "Salvar Alterações"}
        </Button>
      </form>
    </Form>
  );

  if (mode === "edit") {
    return formContent;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex gap-2 items-center">
          <Plus className="h-4 w-4" /> Nova Lavanderia
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Nova Lavanderia</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
