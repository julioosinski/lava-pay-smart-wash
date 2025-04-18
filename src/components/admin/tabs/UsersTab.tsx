
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash } from "lucide-react";
import { SearchBar } from "../SearchBar";
import { User } from "@/types";

interface UsersTabProps {
  users: User[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function UsersTab({ users, searchQuery, onSearchChange }: UsersTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SearchBar
          placeholder="Buscar usuários..."
          value={searchQuery}
          onChange={onSearchChange}
        />
        <Button className="bg-lavapay-500 hover:bg-lavapay-600">
          <Plus className="mr-2 h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Função</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.role === 'admin' && 'Administrador'}
                  {user.role === 'owner' && 'Proprietário'}
                  {user.role === 'customer' && 'Cliente'}
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
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
