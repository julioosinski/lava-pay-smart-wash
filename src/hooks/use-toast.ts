
import { toast as sonnerToast } from "sonner";
import { Toast, ToastActionElement, type ToastProps } from "@/components/ui/toast";
import { create } from "zustand";

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

// Define the store type with the toast function included
type ToastStore = {
  toasts: ToasterToast[];
  addToast: (toast: Omit<ToasterToast, "id">) => void;
  dismissToast: (id: string) => void;
  toast: {
    default: (props: Omit<ToasterToast, "id">) => void;
    success: (title: string, props?: Omit<ToasterToast, "id">) => void;
    error: (title: string, props?: Omit<ToasterToast, "id">) => void;
    warning: (title: string, props?: Omit<ToasterToast, "id">) => void;
  };
};

// Create the store with the toast object included in the returned state
export const useToast = create<ToastStore>((set) => {
  // Create toast functions
  const toast = {
    // Default toast function
    default: (props: Omit<ToasterToast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      set((state) => ({
        toasts: [...state.toasts, { ...props, id }],
      }));
    },
    // Toast with default variant
    success: (title: string, props?: Omit<ToasterToast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      set((state) => ({
        toasts: [...state.toasts, { ...props, title, variant: "success", id }],
      }));
    },
    error: (title: string, props?: Omit<ToasterToast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      set((state) => ({
        toasts: [...state.toasts, { ...props, title, variant: "destructive", id }],
      }));
    },
    warning: (title: string, props?: Omit<ToasterToast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      set((state) => ({
        toasts: [...state.toasts, { ...props, title, variant: "warning", id }],
      }));
    },
  };
  
  return {
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
    toast,
  };
});

// For compatibility with previous code
export const toast = {
  default: (props: Omit<ToasterToast, "id">) => useToast.getState().toast.default(props),
  success: (title: string, props?: Omit<ToasterToast, "id">) => useToast.getState().toast.success(title, props),
  error: (title: string, props?: Omit<ToasterToast, "id">) => useToast.getState().toast.error(title, props),
  warning: (title: string, props?: Omit<ToasterToast, "id">) => useToast.getState().toast.warning(title, props),
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
