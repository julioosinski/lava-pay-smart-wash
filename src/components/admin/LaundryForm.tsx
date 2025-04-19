
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCreateLaundry, useUpdateLaundry } from "@/hooks/useLaundries";
import { LaundryLocation } from "@/types";
import { toast } from "sonner";
import { LaundryFormContent } from "./laundry-form/LaundryFormContent";
import { formSchema, FormValues } from "./laundry-form/schema";
import { createBusinessOwner } from "@/services/businessOwner";

interface LaundryFormProps {
  initialData?: LaundryLocation;
  mode?: "create" | "edit";
}

export function LaundryForm({ initialData, mode = "create" }: LaundryFormProps) {
  const [open, setOpen] = useState(false);
  const createLaundry = useCreateLaundry();
  const updateLaundry = useUpdateLaundry();

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
        // First create the business owner
        const { userId } = await createBusinessOwner({
          email: values.contact_email,
          phone: values.contact_phone
        });

        if (!userId) {
          throw new Error("Erro ao criar ou encontrar o usuário proprietário");
        }

        console.log("Business owner created or found with ID:", userId);

        // Then create the laundry associated with that owner
        await createLaundry.mutateAsync({
          ...values,
          owner_id: userId
        });
        
        setOpen(false);
        form.reset();
        toast.success("Lavanderia criada com sucesso! O proprietário pode fazer login usando o email e o telefone como senha.");
      } else if (initialData?.id) {
        await updateLaundry.mutateAsync({
          id: initialData.id,
          ...values
        });
        toast.success("Lavanderia atualizada com sucesso!");
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Erro ao processar a lavanderia: " + (error instanceof Error ? error.message : "Erro desconhecido"));
    }
  };

  const formContent = (
    <LaundryFormContent 
      form={form} 
      onSubmit={onSubmit} 
      mode={mode} 
      isLoading={createLaundry.isPending || updateLaundry.isPending}
    />
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
