
import { useToast as useShadcnToast } from "@/components/ui/toast";

// Create a simple toast function we can import anywhere
export const toast = {
  success: (message: string) => {
    const { toast } = useShadcnToast();
    toast({
      title: "Sucesso",
      description: message,
      variant: "success",
    });
  },
  error: (message: string) => {
    const { toast } = useShadcnToast();
    toast({
      title: "Erro",
      description: message,
      variant: "destructive",
    });
  },
  warning: (message: string) => {
    const { toast } = useShadcnToast();
    toast({
      title: "Aviso",
      description: message,
      variant: "warning",
    });
  },
  info: (message: string) => {
    const { toast } = useShadcnToast();
    toast({
      title: "Informação",
      description: message,
    });
  }
};

// Export the useToast hook for component usage
export { useShadcnToast as useToast };
