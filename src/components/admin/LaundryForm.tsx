
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCreateLaundry, useUpdateLaundry } from "@/hooks/useLaundries";
import { LaundryLocation, BusinessOwner } from "@/types";
import { toast } from "sonner";
import { LaundryFormContent } from "./laundry-form/LaundryFormContent";
import { formSchema, FormValues } from "./laundry-form/schema";
import { useBusinessOwners } from "@/hooks/useBusinessOwners";

interface LaundryFormProps {
  initialData?: LaundryLocation;
  mode?: "create" | "edit";
  onSuccess?: () => void;
}

export function LaundryForm({ initialData, mode = "create", onSuccess }: LaundryFormProps) {
  const [open, setOpen] = useState(false);
  const createLaundry = useCreateLaundry();
  const updateLaundry = useUpdateLaundry();
  const { data: businessOwners = [], isLoading: isLoadingOwners, refetch } = useBusinessOwners();
  
  // Adicionando um refetch ao abrir o modal para garantir dados atualizados
  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);
  
  // Debug para ver se temos proprietários disponíveis
  console.log("LaundryForm - businessOwners:", businessOwners);

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
      owner_id: Array.isArray(businessOwners) && businessOwners.length > 0 ? businessOwners[0].id : ""
    },
  });

  // Atualizar o campo owner_id quando os proprietários carregarem
  useEffect(() => {
    if (Array.isArray(businessOwners) && businessOwners.length > 0 && !initialData && !form.getValues('owner_id')) {
      form.setValue('owner_id', businessOwners[0].id);
    }
  }, [businessOwners, form, initialData]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (mode === "create") {
        await createLaundry.mutateAsync({
          name: values.name,
          address: values.address,
          contact_phone: values.contact_phone,
          contact_email: values.contact_email,
          owner_id: values.owner_id
        });
        
        setOpen(false);
        form.reset();
        onSuccess?.();
        toast.success("Lavanderia criada com sucesso!");
      } else if (initialData?.id) {
        await updateLaundry.mutateAsync({
          id: initialData.id,
          name: values.name,
          address: values.address,
          contact_phone: values.contact_phone,
          contact_email: values.contact_email,
          owner_id: values.owner_id
        });
        onSuccess?.();
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
      businessOwners={businessOwners as BusinessOwner[]}
      isLoading={createLaundry.isPending || updateLaundry.isPending || isLoadingOwners}
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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Lavanderia</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar uma nova lavanderia
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
