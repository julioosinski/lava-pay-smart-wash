
import { Machine } from "@/types";
import { MachineCard } from "@/components/MachineCard";

interface MachineSelectionProps {
  machines: Machine[];
  onMachineSelect: (machine: Machine) => void;
}

export function MachineSelection({ machines, onMachineSelect }: MachineSelectionProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Selecione uma Máquina</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {machines.map((machine) => (
          <MachineCard 
            key={machine.id} 
            machine={machine} 
            onSelect={() => onMachineSelect(machine)}
          />
        ))}
      </div>
    </div>
  );
}
