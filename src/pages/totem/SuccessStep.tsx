
import { Machine } from "@/types";
import { PaymentSuccess } from "@/components/totem/PaymentSuccess";

interface SuccessStepProps {
  machine: Machine;
  onBackToStart: () => void;
}
export function SuccessStep({ machine, onBackToStart }: SuccessStepProps) {
  return (
    <PaymentSuccess
      machine={machine}
      onBackToStart={onBackToStart}
    />
  );
}
