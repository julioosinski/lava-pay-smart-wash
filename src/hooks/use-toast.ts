
import { toast as sonnerToast } from "sonner";
import { toast as shadcnToast } from "@/components/ui/toast";
import { ToastAction } from "@/components/ui/toast";
import { useToast as useShadcnToast } from "@/components/ui/toast";
import { type Toast } from "@/components/ui/toast";

export const toast = shadcnToast;

// Create a simplified toast interface with success and error methods
export const simplifiedToast = {
  success: (message: string) => {
    return sonnerToast.success(message);
  },
  error: (message: string) => {
    return sonnerToast.error(message);
  },
  info: (message: string) => {
    return sonnerToast.info(message);
  },
  warning: (message: string) => {
    return sonnerToast.warning(message);
  }
};

export const useToast = useShadcnToast;

export default useToast;
