
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MachineCard } from "@/components/MachineCard";
import { AlertCircle } from "lucide-react";
import { MachineForm } from "@/components/admin/machines/MachineForm";
import { Machine, LaundryLocation } from "@/types";
import { useEffect } from "react";

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
  console.log("MachinesTab - machines count:", machines.length);
  console.log("MachinesTab - ownerLaundries count:", ownerLaundries.length);
  
  // Selecionar a primeira lavanderia automaticamente se nenhuma estiver selecionada
  useEffect(() => {
    if (ownerLaundries.length > 0 && (selectedLocation === "all" || !selectedLocation)) {
      setSelectedLocation(ownerLaundries[0].id);
      console.log(`Auto-selecting first laundry: ${ownerLaundries[0].name} (${ownerLaundries[0].id})`);
    }
  }, [ownerLaundries, selectedLocation, setSelectedLocation]);
  
  // Filter machines based on selected location
  const filteredMachines = selectedLocation === "all" 
    ? machines 
    : machines.filter(machine => machine.laundry_id === selectedLocation);
  
  console.log("MachinesTab - filteredMachines after filtering:", filteredMachines.length);

  // Organizar as máquinas por número
  const sortedMachines = [...filteredMachines].sort((a, b) => 
    (a.machine_number || 0) - (b.machine_number || 0)
  );

  // Encontrar o nome da lavanderia selecionada
  const selectedLaundryName = ownerLaundries.find(
    laundry => laundry.id === selectedLocation
  )?.name || "Todas as lavanderias";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Gerenciamento de Máquinas</CardTitle>
              <CardDescription>
                {selectedLocation === "all" 
                  ? "Visualizar todas as máquinas" 
                  : `Máquinas da lavanderia: ${selectedLaundryName}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecionar lavanderia" />
                </SelectTrigger>
                <SelectContent>
                  {ownerLaundries.length > 1 && <SelectItem value="all">Todas as lavanderias</SelectItem>}
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
            {sortedMachines.length > 0 ? (
              sortedMachines.map(machine => (
                <MachineCard 
                  key={machine.id} 
                  machine={machine} 
                  showActions={false}
                  showEdit={true}
                />
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {selectedLocation === "all"
                      ? "Nenhuma máquina encontrada em nenhuma lavanderia."
                      : "Nenhuma máquina encontrada para esta lavanderia. Adicione uma nova máquina."}
                  </p>
                  {selectedLocation !== "all" && (
                    <Button 
                      onClick={() => {
                        const machineForm = document.querySelector("[data-machine-form-button]");
                        if (machineForm instanceof HTMLElement) {
                          machineForm.click();
                        }
                      }}
                      className="mt-4"
                    >
                      Adicionar Máquina
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
