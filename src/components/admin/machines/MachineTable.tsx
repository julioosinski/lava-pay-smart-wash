
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Machine } from "@/types";
import { MachineTableHeader } from "./table/TableHeader";
import { TableActions } from "./table/TableActions";
import { EmptyState } from "./table/EmptyState";

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
      <MachineTableHeader />
      <TableBody>
        {machines.length === 0 ? (
          <EmptyState />
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
                <TableActions 
                  machine={machine} 
                  onDeleteClick={onDeleteMachine}
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
