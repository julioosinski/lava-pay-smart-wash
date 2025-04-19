
import { Card } from "@/components/ui/card";
import { SearchBar } from "../SearchBar";
import { Machine, LaundryLocation } from "@/types";
import { useLaundries } from "@/hooks/useLaundries";
import { useDeleteMachine } from "@/hooks/useMachines";
import { useState } from "react";
import { toast } from "sonner";
import { MachineTable } from "../machines/MachineTable";
import { DeleteMachineDialog } from "../machines/DeleteMachineDialog";
import { MachinesFilter } from "../machines/MachinesFilter";

interface MachinesTabProps {
  machines: Machine[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function MachinesTab({ machines, searchQuery, onSearchChange }: MachinesTabProps) {
  const { data: laundries = [] } = useLaundries();
  const [selectedLaundryId, setSelectedLaundryId] = useState<string>("all");
  const deleteMachine = useDeleteMachine();
  const [machineToDelete, setMachineToDelete] = useState<Machine | null>(null);

  // Filter machines based on search and selected laundry
  const filteredMachines = machines.filter(machine => {
    const machineNumber = machine.machine_number?.toString() || '';
    const matchesSearch = 
      machine.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machineNumber.includes(searchQuery.toLowerCase());
    
    if (selectedLaundryId !== "all") {
      return matchesSearch && machine.laundry_id === selectedLaundryId;
    }
    
    return matchesSearch;
  });

  const handleDeleteConfirm = async () => {
    if (!machineToDelete) return;
    
    try {
      await deleteMachine.mutateAsync({
        id: machineToDelete.id,
        laundry_id: machineToDelete.laundry_id
      });
      toast.success("Máquina excluída com sucesso");
    } catch (error) {
      console.error("Error deleting machine:", error);
      toast.error("Erro ao excluir máquina");
    } finally {
      setMachineToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <SearchBar
          placeholder="Buscar máquinas..."
          value={searchQuery}
          onChange={onSearchChange}
        />
        
        <MachinesFilter 
          selectedLaundryId={selectedLaundryId}
          onLaundryChange={setSelectedLaundryId}
          laundries={laundries}
        />
      </div>

      <Card>
        <MachineTable 
          machines={filteredMachines}
          onDeleteMachine={setMachineToDelete}
        />
      </Card>

      <DeleteMachineDialog
        machine={machineToDelete}
        onClose={() => setMachineToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
