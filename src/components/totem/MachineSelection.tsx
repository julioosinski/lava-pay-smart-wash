
import { Machine } from "@/types";
import { MachineCard } from "@/components/MachineCard";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MachineSelectionProps {
  machines: Machine[];
  onMachineSelect: (machine: Machine) => void;
  onBackClick: () => void;
  loading?: boolean;
  selectedLaundryId?: string;
}

export function MachineSelection({ 
  machines, 
  onMachineSelect, 
  onBackClick,
  loading = false,
  selectedLaundryId 
}: MachineSelectionProps) {
  // Filtra máquinas primeiro por lavanderia e depois por disponibilidade
  const filteredMachines = machines
    .filter(machine => machine.laundry_id === selectedLaundryId)
    .filter(machine => machine.status === "available");
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-2" onClick={onBackClick}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold">Selecione uma Máquina</h1>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <p className="text-gray-500">Carregando máquinas...</p>
        </div>
      ) : filteredMachines.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600 mb-4">Nenhuma máquina disponível</p>
          <p className="text-sm text-gray-500">Tente novamente mais tarde ou escolha outra lavanderia</p>
          <Button className="mt-6" onClick={onBackClick}>
            Escolher Outra Lavanderia
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMachines.map((machine) => (
            <MachineCard 
              key={machine.id} 
              machine={machine} 
              onSelect={() => onMachineSelect(machine)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
