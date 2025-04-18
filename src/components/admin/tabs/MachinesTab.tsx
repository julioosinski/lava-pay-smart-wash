
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash } from "lucide-react";
import { SearchBar } from "../SearchBar";
import { StatusBadge } from "@/components/StatusBadge";
import { MachineForm } from "../MachineForm";

interface Machine {
  id: string;
  type: 'washer' | 'dryer';
  status: 'available' | 'in-use' | 'maintenance';
  price: number;
  time_minutes: number;
  laundry_id: string;
}

interface MachinesTabProps {
  machines: Machine[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  laundryId?: string;
}

export function MachinesTab({ machines, searchQuery, onSearchChange, laundryId }: MachinesTabProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SearchBar
          placeholder="Buscar máquinas..."
          value={searchQuery}
          onChange={onSearchChange}
        />
        {laundryId && <MachineForm laundryId={laundryId} />}
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
            {machines.map((machine) => (
              <TableRow key={machine.id}>
                <TableCell className="font-medium">{machine.id}</TableCell>
                <TableCell className="capitalize">
                  {machine.type === 'washer' ? 'Lavadora' : 'Secadora'}
                </TableCell>
                <TableCell>
                  <StatusBadge status={machine.status} />
                </TableCell>
                <TableCell>{formatCurrency(machine.price)}</TableCell>
                <TableCell>{machine.time_minutes} min</TableCell>
                <TableCell>{machine.laundry_id}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 mr-1">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
