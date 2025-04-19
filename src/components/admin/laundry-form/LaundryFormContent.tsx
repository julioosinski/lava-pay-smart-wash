
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LaundryFormFields } from "./LaundryFormFields";
import { FormValues } from "./schema";
import { UseFormReturn } from "react-hook-form";

interface LaundryFormContentProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (values: FormValues) => Promise<void>;
  mode: "create" | "edit";
  isLoading: boolean;
}

export function LaundryFormContent({ form, onSubmit, mode, isLoading }: LaundryFormContentProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <LaundryFormFields form={form} />
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {mode === "create" ? "Criar Lavanderia" : "Salvar Alterações"}
        </Button>
      </form>
    </Form>
  );
}
