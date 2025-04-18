
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateLaundry } from "@/hooks/useLaundries";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Define schema for form validation
const laundrySchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  address: z.string().min(5, { message: "Endereço deve ter pelo menos 5 caracteres" }),
  contact_phone: z.string().optional(),
  contact_email: z.string().email({ message: "Email inválido" }).optional().or(z.literal(''))
});

type LaundryFormValues = z.infer<typeof laundrySchema>;

export function LaundryForm() {
  const [open, setOpen] = useState(false);
  const createLaundry = useCreateLaundry();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Create form with react-hook-form and zod validation
  const form = useForm<LaundryFormValues>({
    resolver: zodResolver(laundrySchema),
    defaultValues: {
      name: "",
      address: "",
      contact_phone: "",
      contact_email: ""
    }
  });

  const onSubmit = async (data: LaundryFormValues) => {
    try {
      setLoading(true);
      
      if (!user) {
        toast.error('Você precisa estar autenticado para criar uma lavanderia');
        setOpen(false);
        navigate('/auth');
        return;
      }
      
      console.log("Submitting laundry data:", data);
      
      await createLaundry.mutateAsync({
        name: data.name,
        address: data.address,
        contact_phone: data.contact_phone,
        contact_email: data.contact_email
      });
      
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error creating laundry:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex gap-2 items-center">
          <Plus className="h-4 w-4" /> Nova Lavanderia
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Lavanderia</DialogTitle>
          <DialogDescription>
            Preencha os dados para adicionar uma nova lavanderia ao sistema.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome da lavanderia" />
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
                    <Input {...field} placeholder="Endereço completo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="(00) 00000-0000" />
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
                      <Input {...field} type="email" placeholder="contato@exemplo.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading || createLaundry.isPending}
            >
              {loading || createLaundry.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
