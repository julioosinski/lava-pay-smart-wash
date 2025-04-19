
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCreateLaundry, useUpdateLaundry } from "@/hooks/useLaundries";
import { LaundryLocation } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LaundryFormContent } from "./laundry-form/LaundryFormContent";
import { formSchema, FormValues } from "./laundry-form/schema";

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
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('contact_email', values.contact_email)
          .maybeSingle();

        let userId;

        if (existingUser) {
          userId = existingUser.id;
        } else {
          const { data: newUser, error: signUpError } = await supabase.auth.signUp({
            email: values.contact_email,
            password: values.contact_phone.replace(/\D/g, ''),
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
      }
    } catch (error) {
      console.error("Error in form submission:", error);
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
