
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash } from "lucide-react";
import { SearchBar } from "../SearchBar";
import { useLaundries } from "@/hooks/useLaundries";
import { LaundryForm } from "@/components/admin/LaundryForm";

interface LaundryTabProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function LaundryTab({ searchQuery, onSearchChange }: LaundryTabProps) {
  const { data: laundries = [], isLoading } = useLaundries();

  const filteredLaundries = laundries.filter(laundry =>
    laundry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    laundry.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div>Carregando...</div>;
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
            {filteredLaundries.map((laundry) => (
              <TableRow key={laundry.id}>
                <TableCell className="font-medium">{laundry.name}</TableCell>
                <TableCell>{laundry.address}</TableCell>
                <TableCell>{laundry.owner_id}</TableCell>
                <TableCell>0</TableCell>
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
