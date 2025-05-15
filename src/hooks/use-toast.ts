
import { toast as sonnerToast } from "sonner";

// Define the simplifiedToast interface for easier use
export interface SimplifiedToast {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

// Create a simplified toast interface
export const toast: SimplifiedToast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
  info: (message: string) => sonnerToast.info(message),
  warning: (message: string) => sonnerToast.warning(message),
};

// Re-export the original toast for advanced usage
export { sonnerToast as useToast };
