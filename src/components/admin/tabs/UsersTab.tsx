
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash, Mail, Phone } from "lucide-react";
import { SearchBar } from "../SearchBar";
import { User } from "@/types";
import { UserForm } from "../UserForm";
import { useBusinessOwners } from "@/hooks/useBusinessOwners";

interface UsersTabProps {
  users: User[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function UsersTab({ searchQuery, onSearchChange }: UsersTabProps) {
  const [showUserForm, setShowUserForm] = useState(false);
  const { data: businessOwners = [], isLoading } = useBusinessOwners();

  const filteredUsers = businessOwners.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SearchBar
          placeholder="Buscar proprietários..."
          value={searchQuery}
          onChange={onSearchChange}
        />
        <Button 
          className="bg-lavapay-500 hover:bg-lavapay-600"
          onClick={() => setShowUserForm(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Proprietário
        </Button>
      </div>

      {showUserForm && (
        <UserForm
          onClose={() => setShowUserForm(false)}
          onSuccess={() => setShowUserForm(false)}
        />
      )}

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
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  Nenhum proprietário encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 mr-1">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
