
import { toast as sonnerToast } from "sonner";
import { Toast, ToastActionElement, type ToastProps } from "@/components/ui/toast";
import { create } from "zustand";

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type ToastStore = {
  toasts: ToasterToast[];
  addToast: (toast: Omit<ToasterToast, "id">) => void;
  dismissToast: (id: string) => void;
};

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
  },
  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));

// Create toast function to match shadcn pattern
export const toast = {
  // Default toast function
  default: (props: Omit<ToasterToast, "id">) => useToast.getState().addToast(props),
  // Toast with default variant
  success: (title: string, props?: Omit<ToasterToast, "id">) => {
    useToast.getState().addToast({ ...props, title, variant: "success" });
  },
  error: (title: string, props?: Omit<ToasterToast, "id">) => {
    useToast.getState().addToast({ ...props, title, variant: "destructive" });
  },
  warning: (title: string, props?: Omit<ToasterToast, "id">) => {
    useToast.getState().addToast({ ...props, title, variant: "warning" });
  },
};

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

export default useToast;
