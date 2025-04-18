
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash } from "lucide-react";
import { SearchBar } from "../SearchBar";
import { LaundryLocation } from "@/types";

interface LaundryTabProps {
  laundries: LaundryLocation[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function LaundryTab({ laundries, searchQuery, onSearchChange }: LaundryTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SearchBar
          placeholder="Buscar lavanderias..."
          value={searchQuery}
          onChange={onSearchChange}
        />
        <Button className="bg-lavapay-500 hover:bg-lavapay-600">
          <Plus className="mr-2 h-4 w-4" /> Nova Lavanderia
        </Button>
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
            {laundries.map((laundry) => (
              <TableRow key={laundry.id}>
                <TableCell className="font-medium">{laundry.name}</TableCell>
                <TableCell>{laundry.address}</TableCell>
                <TableCell>{laundry.ownerId}</TableCell>
                <TableCell>{laundry.machines.length}</TableCell>
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
