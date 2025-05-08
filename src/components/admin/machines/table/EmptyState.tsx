
import { TableCell, TableRow } from "@/components/ui/table";

export function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
        Nenhuma máquina encontrada para esta lavanderia. Adicione uma nova máquina.
      </TableCell>
    </TableRow>
  );
}
