
import { PaymentError } from "@/components/totem/PaymentError";

interface ErrorStepProps {
  onRetry: () => void;
  onBackToStart: () => void;
}
export function ErrorStep({ onRetry, onBackToStart }: ErrorStepProps) {
  return <PaymentError onRetry={onRetry} onBackToStart={onBackToStart} />;
}
