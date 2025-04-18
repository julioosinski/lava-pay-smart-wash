
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash, Plus } from "lucide-react";
import { SearchBar } from "../SearchBar";
import { useLaundries } from "@/hooks/useLaundries";
import { LaundryForm } from "@/components/admin/LaundryForm";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMachines } from "@/hooks/useMachines";

interface LaundryTabProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function LaundryTab({ searchQuery, onSearchChange }: LaundryTabProps) {
  const { data: laundries = [], isLoading } = useLaundries();
  const { data: allMachines = [] } = useMachines();
  const navigate = useNavigate();

  const filteredLaundries = laundries.filter(laundry =>
    laundry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    laundry.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to view machines for a specific laundry
  const viewMachines = (laundryId: string) => {
    // Here we would navigate to a machines page with the laundry ID
    console.log(`Viewing machines for laundry: ${laundryId}`);
    // For now, we'll just open the machines tab
    const machinesTab = document.querySelector("[data-state='inactive'][value='machines']") as HTMLElement;
    if (machinesTab) {
      machinesTab.click();
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
              <TableHead>Proprietário</TableHead>
              <TableHead>Máquinas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLaundries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Nenhuma lavanderia encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredLaundries.map((laundry) => (
                <TableRow key={laundry.id}>
                  <TableCell className="font-medium">{laundry.name}</TableCell>
                  <TableCell>{laundry.address}</TableCell>
                  <TableCell>{laundry.owner_id.substring(0, 8)}...</TableCell>
                  <TableCell>
                    <Button 
                      variant="link" 
                      onClick={() => viewMachines(laundry.id)}
                      className="p-0 h-auto font-normal"
                    >
                      {getMachineCount(laundry.id)} máquinas
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
