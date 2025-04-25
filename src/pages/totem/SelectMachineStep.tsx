
import { Machine } from "@/types";
import { MachineSelection } from "@/components/totem/MachineSelection";

interface SelectMachineStepProps {
  machines: Machine[];
  onSelect: (machine: Machine) => void;
  onBack: () => void;
  loading: boolean;
  selectedLaundryId: string;
}

export function SelectMachineStep({ 
  machines, 
  onSelect, 
  onBack, 
  loading,
  selectedLaundryId 
}: SelectMachineStepProps) {
  return (
    <MachineSelection 
      machines={machines}
      onMachineSelect={onSelect}
      onBackClick={onBack}
      loading={loading}
      selectedLaundryId={selectedLaundryId}
    />
  );
}
