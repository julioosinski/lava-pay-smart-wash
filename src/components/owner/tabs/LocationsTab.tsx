
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LaundryForm } from "@/components/admin/LaundryForm";
import { LaundryLocation, Machine } from "@/types";
import { AlertCircle, WashingMachine, CheckCircle, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EditLaundryDialog } from "@/components/admin/EditLaundryDialog";
import { DeleteLaundryDialog } from "@/components/admin/DeleteLaundryDialog";
import { useDeleteLaundry } from "@/hooks/laundry/useDeleteLaundry";

interface LocationsTabProps {
  laundries: LaundryLocation[];
  machines?: Machine[];
  isLoading: boolean;
  refetchLaundries: () => void;
  isAdmin?: boolean;
  onSelectLocation?: (locationId: string) => void;
}

export function LocationsTab({ 
  laundries, 
  machines = [], 
  isLoading, 
  refetchLaundries,
  isAdmin = false,
  onSelectLocation 
}: LocationsTabProps) {
  const [selectedLaundry, setSelectedLaundry] = useState<LaundryLocation | null>(null);
  const [laundryToDelete, setLaundryToDelete] = useState<LaundryLocation | null>(null);
  const deleteLaundry = useDeleteLaundry();

  // Count machines per laundry
  const getMachineCount = (laundryId: string) => {
    return machines.filter(machine => machine.laundry_id === laundryId).length;
  };

  const getAvailableMachineCount = (laundryId: string) => {
    return machines.filter(machine => 
      machine.laundry_id === laundryId && 
      machine.status === 'available'
    ).length;
  };

  const handleManage = (location: LaundryLocation) => {
    if (onSelectLocation) {
      onSelectLocation(location.id);
    }
    setSelectedLaundry(null);
  };

  const handleEdit = (location: LaundryLocation) => {
    setSelectedLaundry(location);
  };

  const handleDelete = (location: LaundryLocation) => {
    setLaundryToDelete(location);
  };

  const handleDeleteConfirm = async () => {
    if (laundryToDelete) {
      await deleteLaundry.mutateAsync(laundryToDelete.id);
      setLaundryToDelete(null);
      if (refetchLaundries) {
        refetchLaundries();
      }
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Carregando lavanderias...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <CardTitle>Lavanderias</CardTitle>
            <CardDescription>Gerenciamento de locais</CardDescription>
          </div>
          <LaundryForm />
        </CardHeader>
        <CardContent>
          {laundries.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma lavanderia cadastrada.</p>
            </div>
          ) : (
            laundries.map(location => {
              const totalCount = getMachineCount(location.id);
              const availableCount = getAvailableMachineCount(location.id);
              
              return (
                <Card key={location.id} className="mb-4 overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-6">
                      <h3 className="text-lg font-semibold mb-1">{location.name}</h3>
                      <p className="text-gray-500 mb-4">{location.address}</p>
                      
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center">
                          <WashingMachine className="h-4 w-4 mr-2 text-lavapay-600" />
                          <span>{totalCount} máquinas</span>
                        </div>
                        
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          <span>{availableCount} disponíveis</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 flex items-center justify-center md:justify-end">
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          variant="outline"
                          onClick={() => handleManage(location)}
                        >
                          Gerenciar
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex gap-1 items-center"
                          onClick={() => handleEdit(location)}
                        >
                          <Edit className="h-4 w-4" /> Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(location)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>

      {selectedLaundry && (
        <EditLaundryDialog
          open={!!selectedLaundry}
          onOpenChange={(open) => !open && setSelectedLaundry(null)}
          laundry={selectedLaundry}
        />
      )}

      <DeleteLaundryDialog
        laundry={laundryToDelete}
        onClose={() => setLaundryToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
