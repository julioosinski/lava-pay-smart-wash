
import { Machine } from "@/types";
import { MachineCard } from "@/components/MachineCard";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
  const [filterStatus, setFilterStatus] = useState<"all" | "available">("available");
  
  // Filtra máquinas primeiro por lavanderia e depois por status (disponível ou todas)
  const laundryMachines = machines.filter(machine => 
    machine.laundry_id === selectedLaundryId
  );
  
  const filteredMachines = filterStatus === "all"
    ? laundryMachines
    : laundryMachines.filter(machine => machine.status === "available");
  
  // Organizar máquinas por número
  const sortedMachines = [...filteredMachines].sort((a, b) => 
    (a.machine_number || 0) - (b.machine_number || 0)
  );
  
  // Contar máquinas disponíveis e em uso
  const availableMachines = laundryMachines.filter(m => m.status === "available").length;
  const inUseMachines = laundryMachines.filter(m => m.status === "in-use").length;
  const totalMachines = laundryMachines.length;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-2" onClick={onBackClick}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold">Máquinas Disponíveis</h1>
      </div>
      
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="text-sm text-gray-500">
          {availableMachines} de {totalMachines} máquinas disponíveis
          {inUseMachines > 0 && ` (${inUseMachines} em uso)`}
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm"
            variant={filterStatus === "available" ? "default" : "outline"} 
            onClick={() => setFilterStatus("available")}
          >
            Disponíveis
          </Button>
          <Button 
            size="sm"
            variant={filterStatus === "all" ? "default" : "outline"} 
            onClick={() => setFilterStatus("all")}
          >
            Todas
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <p className="text-gray-500">Carregando máquinas...</p>
        </div>
      ) : sortedMachines.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600 mb-4">
            {filterStatus === "available" ? "Nenhuma máquina disponível" : "Nenhuma máquina encontrada"}
          </p>
          <p className="text-sm text-gray-500">
            {filterStatus === "available" 
              ? "Tente novamente mais tarde ou escolha outra lavanderia" 
              : "Esta lavanderia ainda não possui máquinas cadastradas"}
          </p>
          <Button className="mt-6" onClick={onBackClick}>
            Escolher Outra Lavanderia
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedMachines.map((machine) => (
            <MachineCard 
              key={machine.id} 
              machine={machine} 
              onSelect={() => machine.status === "available" ? onMachineSelect(machine) : null}
              disabled={machine.status !== "available"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
