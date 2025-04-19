
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash, Mail, Phone } from "lucide-react";
import { SearchBar } from "../SearchBar";
import { BusinessOwner } from "@/types";
import { UserForm } from "../UserForm";
import { useBusinessOwners } from "@/hooks/useBusinessOwners";
import { DeleteUserDialog } from "../DeleteUserDialog";
import { deleteBusinessOwner } from "@/services/businessOwner";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface UsersTabProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function UsersTab({ searchQuery, onSearchChange }: UsersTabProps) {
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BusinessOwner | null>(null);
  const [userToDelete, setUserToDelete] = useState<BusinessOwner | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const { data: businessOwners = [], isLoading, refetch } = useBusinessOwners();
  const queryClient = useQueryClient();

  const filteredUsers = businessOwners.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery)
  );
  
  // Manipuladores para editar e excluir
  const handleEdit = (user: BusinessOwner) => {
    if (isProcessingAction) return;
    console.log("Editando usuário:", user);
    setSelectedUser(user);
    setShowUserForm(true);
  };
  
  const handleDelete = (user: BusinessOwner) => {
    if (isProcessingAction) return;
    console.log("Preparando para excluir usuário:", user);
    setUserToDelete(user);
  };
  
  const handleDeleteConfirm = async () => {
    if (userToDelete && !isProcessingAction) {
      try {
        setIsProcessingAction(true);
        console.log("Confirmando exclusão do usuário:", userToDelete.id);
        const result = await deleteBusinessOwner(userToDelete.id);
        
        if (result.success) {
          toast.success("Proprietário excluído com sucesso");
          
          // Forçar uma nova busca imediatamente
          await queryClient.invalidateQueries({ queryKey: ['business-owners'] });
          
          // Esperar um intervalo maior e então forçar refetch
          setTimeout(async () => {
            await refetch();
          }, 1000);
        } else {
          toast.error(result.error || "Não foi possível excluir o proprietário");
        }
      } catch (error) {
        toast.error("Erro ao excluir proprietário");
        console.error("Error deleting business owner:", error);
      } finally {
        setUserToDelete(null);
        setIsProcessingAction(false);
      }
    }
  };
  
  const handleFormClose = () => {
    if (isProcessingAction) return;
    setShowUserForm(false);
    setSelectedUser(null);
  };

  const handleFormSuccess = async () => {
    if (isProcessingAction) return;
    
    try {
      setIsProcessingAction(true);
      setShowUserForm(false);
      setSelectedUser(null);
      
      // Forçar uma nova busca imediatamente
      await queryClient.invalidateQueries({ queryKey: ['business-owners'] });
      
      // Esperar um intervalo maior e então forçar refetch
      setTimeout(async () => {
        await refetch();
      }, 1000);
    } finally {
      setIsProcessingAction(false);
    }
  };

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
          onClick={() => {
            if (isProcessingAction) return;
            setSelectedUser(null);
            setShowUserForm(true);
          }}
          disabled={isProcessingAction}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Proprietário
        </Button>
      </div>

      {showUserForm && (
        <UserForm
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          user={selectedUser}
          mode={selectedUser ? "edit" : "create"}
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 mr-1"
                      onClick={() => handleEdit(user)}
                      disabled={isProcessingAction}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500"
                      onClick={() => handleDelete(user)}
                      disabled={isProcessingAction}
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

      <DeleteUserDialog
        user={userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
