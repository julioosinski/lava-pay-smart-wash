
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash, Plus } from "lucide-react";
import { SearchBar } from "../SearchBar";
import { StatusBadge } from "@/components/StatusBadge";
import { MachineForm } from "../MachineForm";
import { Machine } from "@/types";
import { useLaundries } from "@/hooks/useLaundries";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MachinesTabProps {
  machines: Machine[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function MachinesTab({ machines, searchQuery, onSearchChange }: MachinesTabProps) {
  const { data: laundries = [] } = useLaundries();
  const [selectedLaundryId, setSelectedLaundryId] = useState<string>("all");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Filter machines based on search and selected laundry
  const filteredMachines = machines.filter(machine => {
    const matchesSearch = 
      machine.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedLaundryId !== "all") {
      return matchesSearch && machine.laundry_id === selectedLaundryId;
    }
    
    return matchesSearch;
  });

  // Get laundry name by id
  const getLaundryName = (id: string) => {
    const laundry = laundries.find(l => l.id === id);
    return laundry ? laundry.name : id.substring(0, 8) + '...';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-grow">
          <SearchBar
            placeholder="Buscar máquinas..."
            value={searchQuery}
            onChange={onSearchChange}
          />
          
          <div className="min-w-[200px]">
            <Select value={selectedLaundryId} onValueChange={setSelectedLaundryId}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por lavanderia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as lavanderias</SelectItem>
                {laundries.map(laundry => (
                  <SelectItem key={laundry.id} value={laundry.id}>
                    {laundry.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {selectedLaundryId && selectedLaundryId !== "all" && (
          <MachineForm laundryId={selectedLaundryId} />
        )}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Tempo</TableHead>
              <TableHead>Lavanderia</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMachines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {selectedLaundryId !== "all" 
                    ? "Nenhuma máquina encontrada para esta lavanderia. Adicione uma nova máquina."
                    : "Selecione uma lavanderia para adicionar máquinas"}
                </TableCell>
              </TableRow>
            ) : (
              filteredMachines.map((machine) => (
                <TableRow key={machine.id}>
                  <TableCell className="font-medium">{machine.id.substring(0, 8)}...</TableCell>
                  <TableCell className="capitalize">
                    {machine.type === 'washer' ? 'Lavadora' : 'Secadora'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={machine.status} />
                  </TableCell>
                  <TableCell>{formatCurrency(machine.price)}</TableCell>
                  <TableCell>{machine.time_minutes} min</TableCell>
                  <TableCell>{getLaundryName(machine.laundry_id)}</TableCell>
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
