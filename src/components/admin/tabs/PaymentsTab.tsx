
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCcw } from "lucide-react";
import { SearchBar } from "../SearchBar";
import { StatusBadge } from "@/components/StatusBadge";
import { Payment } from "@/types";

interface PaymentsTabProps {
  payments: Payment[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function PaymentsTab({ payments, searchQuery, onSearchChange }: PaymentsTabProps) {
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SearchBar
          placeholder="Buscar pagamentos..."
          value={searchQuery}
          onChange={onSearchChange}
        />
        <Button variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" /> Atualizar
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Máquina</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>ID Transação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.id}</TableCell>
                <TableCell>{payment.machine_id}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(payment.amount)}
                </TableCell>
                <TableCell className="capitalize">{payment.method}</TableCell>
                <TableCell>
                  <StatusBadge status={payment.status} />
                </TableCell>
                <TableCell>{formatDateTime(payment.created_at)}</TableCell>
                <TableCell>{payment.transaction_id || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
