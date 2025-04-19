
import { BusinessOwner } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash, Mail, Phone } from "lucide-react";

interface UsersTableProps {
  users: BusinessOwner[];
  isLoading: boolean;
  onEdit: (user: BusinessOwner) => void;
  onDelete: (user: BusinessOwner) => void;
  isProcessing: boolean;
}

export function UsersTable({ 
  users, 
  isLoading, 
  onEdit, 
  onDelete,
  isProcessing 
}: UsersTableProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Função</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                Carregando...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                Nenhum proprietário encontrado
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name || 'Sem nome'}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    {user.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {user.email}
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {user.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  Proprietário
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 mr-1"
                    onClick={() => onEdit(user)}
                    disabled={isProcessing}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-500"
                    onClick={() => onDelete(user)}
                    disabled={isProcessing}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
