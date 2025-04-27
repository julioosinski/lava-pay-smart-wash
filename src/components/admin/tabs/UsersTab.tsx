
import { useBusinessOwners } from "@/hooks/useBusinessOwners";
import { useUserActions } from "@/hooks/admin/useUserActions";
import { UsersHeader } from "../users/UsersHeader";
import { UsersTable } from "../users/UsersTable";
import { UserForm } from "../UserForm";
import { DeleteUserDialog } from "../DeleteUserDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UsersTabProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function UsersTab({ searchQuery, onSearchChange }: UsersTabProps) {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Força uma atualização completa ao montar o componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Remove completamente os dados do cache
        queryClient.removeQueries({ queryKey: ['business-owners'] });
        
        // Força um refetch
        await queryClient.fetchQuery({ queryKey: ['business-owners'] });
        
        console.log("Dados de proprietários atualizados com sucesso");
      } catch (error) {
        console.error("Erro ao atualizar dados de proprietários:", error);
        toast.error("Erro ao carregar proprietários. Tente novamente.");
      } finally {
        setIsInitialLoad(false);
      }
    };
    
    fetchData();
  }, [queryClient]);
  
  const { 
    data: businessOwners = [], 
    isLoading: isLoadingOwners, 
    refetch, 
    error: ownersError
  } = useBusinessOwners();
  
  // Mostrar erro de carregamento
  useEffect(() => {
    if (ownersError && !isInitialLoad) {
      console.error("Erro ao carregar proprietários:", ownersError);
      toast.error("Erro ao carregar proprietários. Tente novamente.");
    }
  }, [ownersError, isInitialLoad]);
  
  const { 
    selectedUser,
    userToDelete,
    showUserForm,
    isProcessingAction,
    handleEdit,
    handleDelete,
    handleDeleteConfirm,
    handleFormClose,
    handleFormSuccess,
    setShowUserForm,
    setSelectedUser,
    setUserToDelete
  } = useUserActions(refetch);
  
  const filteredUsers = businessOwners.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery)
  );

  return (
    <div className={`space-y-4 md:space-y-6 ${isMobile ? 'px-2' : 'px-4'}`}>
      <UsersHeader 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onNewUser={() => {
          if (isProcessingAction) return;
          setSelectedUser(null);
          setShowUserForm(true);
        }}
        isProcessing={isProcessingAction}
      />

      {showUserForm && (
        <UserForm
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          user={selectedUser}
          mode={selectedUser ? "edit" : "create"}
        />
      )}

      <div className="overflow-x-auto">
        <UsersTable 
          users={filteredUsers}
          isLoading={isLoadingOwners || isInitialLoad}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isProcessing={isProcessingAction}
        />
      </div>

      <DeleteUserDialog
        user={userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isProcessing={isProcessingAction}
      />
    </div>
  );
}
