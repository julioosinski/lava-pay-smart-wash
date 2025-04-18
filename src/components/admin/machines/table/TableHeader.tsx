
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function MachineTableHeader() {
  return (
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
  );
}
