
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MachineCard } from "@/components/MachineCard";
import { AlertCircle } from "lucide-react";
import { MachineForm } from "@/components/admin/MachineForm";
import { Machine, LaundryLocation } from "@/types";

interface MachinesTabProps {
  machines: Machine[];
  ownerLaundries: LaundryLocation[];
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
}

export function MachinesTab({
  machines,
  ownerLaundries,
  selectedLocation,
  setSelectedLocation
}: MachinesTabProps) {
  console.log("MachinesTab - machines received:", machines);
  console.log("MachinesTab - ownerLaundries:", ownerLaundries);
  console.log("MachinesTab - selectedLocation:", selectedLocation);
  
  // Filter machines based on selected location
  const filteredMachines = selectedLocation === "all" 
    ? machines 
    : machines.filter(machine => {
        const matches = machine.laundry_id === selectedLocation;
        console.log(`Machine ${machine.id} matches selected location ${selectedLocation}: ${matches}`);
        return matches;
      });
  
  console.log("MachinesTab - filteredMachines after filtering:", filteredMachines);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Gerenciamento de Máquinas</CardTitle>
              <CardDescription>Visualizar e gerenciar suas máquinas</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecionar lavanderia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as lavanderias</SelectItem>
                  {ownerLaundries.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedLocation !== "all" && (
                <MachineForm 
                  laundryId={selectedLocation}
                  variant="create"
                />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMachines.map(machine => (
              <MachineCard 
                key={machine.id} 
                machine={machine} 
                showActions={false}
                showEdit={true}
              />
            ))}
            
            {filteredMachines.length === 0 && (
              <div className="col-span-full flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {selectedLocation === "all"
                      ? "Nenhuma máquina encontrada. Selecione uma lavanderia específica para adicionar máquinas."
                      : "Nenhuma máquina encontrada para esta lavanderia. Adicione uma nova máquina."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
