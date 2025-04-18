
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { MachineForm } from "./MachineForm";
import { Machine } from "@/types";

interface MachineTableProps {
  machines: Machine[];
  onDeleteMachine: (machine: Machine) => void;
}

export function MachineTable({ machines, onDeleteMachine }: MachineTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getLaundryName = (id: string) => id.substring(0, 8) + '...';

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Número</TableHead>
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
        {machines.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
              Nenhuma máquina encontrada para esta lavanderia. Adicione uma nova máquina.
            </TableCell>
          </TableRow>
        ) : (
          machines.map((machine) => (
            <TableRow key={machine.id}>
              <TableCell className="font-medium">{machine.machine_number || "-"}</TableCell>
              <TableCell className="font-mono text-xs">{machine.id.substring(0, 8)}...</TableCell>
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
                <MachineForm
                  laundryId={machine.laundry_id}
                  machine={machine}
                  variant="edit"
                  triggerElement={
                    <Button variant="ghost" size="icon" className="h-8 w-8 mr-1">
                      <Edit className="h-4 w-4" />
                    </Button>
                  }
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-red-500"
                  onClick={() => onDeleteMachine(machine)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
