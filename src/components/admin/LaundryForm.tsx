
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
import { useBusinessOwners } from "@/hooks/useBusinessOwners";

interface LaundryFormProps {
  initialData?: LaundryLocation;
  mode?: "create" | "edit";
}

export function LaundryForm({ initialData, mode = "create" }: LaundryFormProps) {
  const [open, setOpen] = useState(false);
  const createLaundry = useCreateLaundry();
  const updateLaundry = useUpdateLaundry();
  const { data: businessOwners = [] } = useBusinessOwners();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      address: initialData.address,
      contact_phone: initialData.contact_phone || "",
      contact_email: initialData.contact_email || "",
      owner_id: initialData.owner_id
    } : {
      name: "",
      address: "",
      contact_phone: "",
      contact_email: "",
      owner_id: businessOwners.length > 0 ? businessOwners[0].id : ""
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      if (mode === "create") {
        // Create the laundry with the selected owner
        await createLaundry.mutateAsync({
          ...values,
        });
        
        setOpen(false);
        form.reset();
        toast.success("Lavanderia criada com sucesso!");
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
      businessOwners={businessOwners}
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
