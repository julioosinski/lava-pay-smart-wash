
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
  
  // Buscar dados dos proprietários
  const { 
    data: businessOwners = [], 
    isLoading: isLoadingOwners, 
    refetch, 
    error: ownersError,
    isError
  } = useBusinessOwners();
  
  // Força uma atualização completa ao montar o componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Forçando atualização dos dados de proprietários...");
        
        // Invalida o cache e força um refetch
        await queryClient.invalidateQueries({ queryKey: ['business-owners'] });
        await refetch();
        
        console.log("Dados de proprietários atualizados com sucesso.");
      } catch (error) {
        console.error("Erro ao atualizar dados de proprietários:", error);
        toast.error("Erro ao carregar proprietários. Tente novamente.");
      } finally {
        setIsInitialLoad(false);
      }
    };
    
    fetchData();
  }, [queryClient, refetch]);
  
  // Mostrar erro de carregamento
  useEffect(() => {
    if ((ownersError || isError) && !isInitialLoad) {
      console.error("Erro ao carregar proprietários:", ownersError);
      toast.error("Erro ao carregar proprietários. Tente novamente.");
    }
  }, [ownersError, isInitialLoad, isError]);
  
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
  
  console.log("UsersTab - proprietários carregados:", businessOwners?.length || 0);
  
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
