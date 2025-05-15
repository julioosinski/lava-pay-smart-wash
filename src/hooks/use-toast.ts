
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
  warning: (message: string) => sonnerToast.warning(message),
  info: (message: string) => sonnerToast.info(message),
};

const dismiss = (toastId?: string) => sonnerToast.dismiss(toastId);

export const simplifiedToast = {
  success: toast.success,
  error: toast.error,
  warning: toast.warning,
  info: toast.info
};

// Maintain compatibility with shadcn/ui toast implementation
export function useToast() {
  return {
    toast,
    dismiss
  };
}

export { toast };
