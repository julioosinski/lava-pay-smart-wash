
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Phone, Mail, Trash, Plus, Building2 } from "lucide-react";
import { SearchBar } from "../SearchBar";
import { useLaundries } from "@/hooks/useLaundries";
import { LaundryForm } from "@/components/admin/LaundryForm";
import { useMachines } from "@/hooks/useMachines";
import { useState } from "react";

interface LaundryTabProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function LaundryTab({ searchQuery, onSearchChange }: LaundryTabProps) {
  const { data: laundries = [], isLoading } = useLaundries();
  const { data: allMachines = [] } = useMachines();
  const [selectedLaundry, setSelectedLaundry] = useState<string | null>(null);

  const filteredLaundries = laundries.filter(laundry =>
    laundry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    laundry.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (laundry.contact_phone && laundry.contact_phone.includes(searchQuery)) ||
    (laundry.contact_email && laundry.contact_email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Function to view machines for a specific laundry
  const viewMachines = (laundryId: string) => {
    // Navigate to machines tab with the laundry ID
    const machinesTab = document.querySelector("[data-state='inactive'][value='machines']") as HTMLElement;
    if (machinesTab) {
      machinesTab.click();
      // Set the selected laundry in the URL or state for machines tab to filter
      setSelectedLaundry(laundryId);
      // The machines tab should pick this up somehow - typically with URL params or state management
    }
  };

  // Count machines per laundry
  const getMachineCount = (laundryId: string) => {
    return allMachines.filter(machine => machine.laundry_id === laundryId).length;
  };

  if (isLoading) {
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
                <TableRow key={laundry.id}>
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
                    <Button 
                      variant="link" 
                      onClick={() => viewMachines(laundry.id)}
                      className="p-0 h-auto font-normal flex items-center gap-1"
                    >
                      <Building2 className="h-3 w-3" /> {getMachineCount(laundry.id)} máquinas
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 mr-1">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
