
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Phone, Mail, Trash, Plus, Building2 } from "lucide-react";
import { SearchBar } from "../SearchBar";
import { useLaundries, useDeleteLaundry } from "@/hooks/useLaundries";
import { LaundryForm } from "@/components/admin/LaundryForm";
import { useMachines } from "@/hooks/useMachines";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EditLaundryDialog } from "../EditLaundryDialog";
import { DeleteLaundryDialog } from "../DeleteLaundryDialog";
import { LaundryLocation } from "@/types";

interface LaundryTabProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  laundries?: LaundryLocation[]; // Added this prop to match what's being passed from Admin.tsx
}

export function LaundryTab({ searchQuery, onSearchChange, laundries: externalLaundries }: LaundryTabProps) {
  // Only fetch laundries if they weren't provided externally
  const { data: fetchedLaundries = [] as LaundryLocation[], isLoading } = useLaundries({ 
    forceShowAll: true,
    // Skip fetch if laundries were provided externally
    options: { enabled: !externalLaundries }
  });
  
  // Use external laundries if provided, otherwise use fetched laundries
  const laundries: LaundryLocation[] = externalLaundries || fetchedLaundries;
  
  const { data: allMachines = [] } = useMachines();
  const [selectedLaundry, setSelectedLaundry] = useState<LaundryLocation | null>(null);
  const [laundryToDelete, setLaundryToDelete] = useState<LaundryLocation | null>(null);
  const navigate = useNavigate();
  
  const deleteLaundry = useDeleteLaundry();

  const filteredLaundries = laundries.filter(laundry =>
    laundry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    laundry.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (laundry.contact_phone && laundry.contact_phone.includes(searchQuery)) ||
    (laundry.contact_email && laundry.contact_email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Count machines per laundry
  const getMachineCount = (laundryId: string) => {
    return allMachines.filter(machine => machine.laundry_id === laundryId).length;
  };

  const handleEdit = (laundry: LaundryLocation) => {
    setSelectedLaundry(laundry);
  };
  
  const handleDelete = (laundry: LaundryLocation) => {
    setLaundryToDelete(laundry);
  };
  
  const confirmDelete = async () => {
    if (laundryToDelete) {
      try {
        await deleteLaundry.mutateAsync(laundryToDelete.id);
        setLaundryToDelete(null);
      } catch (error) {
        console.error("Error deleting laundry:", error);
      }
    }
  };

  if (isLoading && !externalLaundries) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SearchBar
          placeholder="Buscar lavanderias..."
          value={searchQuery}
          onChange={onSearchChange}
        />
        <LaundryForm />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Proprietário</TableHead>
              <TableHead>Máquinas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLaundries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Nenhuma lavanderia encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredLaundries.map((laundry) => (
                <TableRow 
                  key={laundry.id}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell className="font-medium">{laundry.name}</TableCell>
                  <TableCell>{laundry.address}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {laundry.contact_phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {laundry.contact_phone}
                        </div>
                      )}
                      {laundry.contact_email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {laundry.contact_email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{laundry.owner_id.substring(0, 8)}...</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> {getMachineCount(laundry.id)} máquinas
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 mr-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(laundry);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(laundry);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {selectedLaundry && (
        <EditLaundryDialog
          open={!!selectedLaundry}
          onOpenChange={(open) => !open && setSelectedLaundry(null)}
          laundry={selectedLaundry}
        />
      )}
      
      {laundryToDelete && (
        <DeleteLaundryDialog
          laundry={laundryToDelete}
          onClose={() => setLaundryToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
