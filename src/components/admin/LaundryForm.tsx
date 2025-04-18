
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateLaundry } from "@/hooks/useLaundries";
import { Plus } from "lucide-react";

// Define schema for form validation
const laundrySchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  address: z.string().min(5, { message: "Endereço deve ter pelo menos 5 caracteres" }),
  owner_id: z.string().default("00000000-0000-0000-0000-000000000000") // Default UUID for testing
});

type LaundryFormValues = z.infer<typeof laundrySchema>;

export function LaundryForm() {
  const [open, setOpen] = useState(false);
  const createLaundry = useCreateLaundry();

  // Create form with react-hook-form and zod validation
  const form = useForm<LaundryFormValues>({
    resolver: zodResolver(laundrySchema),
    defaultValues: {
      name: "",
      address: "",
      owner_id: "00000000-0000-0000-0000-000000000000" // Default UUID for testing
    }
  });

  const onSubmit = async (data: LaundryFormValues) => {
    try {
      console.log("Submitting laundry data:", data);
      await createLaundry.mutateAsync(data);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error creating laundry:", error);
    }
  };

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

            <Button 
              type="submit" 
              className="w-full"
              disabled={createLaundry.isPending}
            >
              {createLaundry.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
