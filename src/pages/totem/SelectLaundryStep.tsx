
import { LaundryLocation } from "@/types";
import { LaundrySelection } from "@/components/totem/LaundrySelection";

interface SelectLaundryStepProps {
  laundries: LaundryLocation[];
  onSelect: (laundry: LaundryLocation) => void;
  loading: boolean;
}
export function SelectLaundryStep({ laundries, onSelect, loading }: SelectLaundryStepProps) {
  return (
    <LaundrySelection 
      laundries={laundries}
      onLaundrySelect={onSelect}
      loading={loading}
    />
  );
}
