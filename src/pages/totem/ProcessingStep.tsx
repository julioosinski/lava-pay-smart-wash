
import { ProcessingPayment } from "@/components/totem/ProcessingPayment";

export function ProcessingStep() {
  // Simple wrapper with no dependencies that could cause map errors
  return <ProcessingPayment />;
}
