
import { useState } from "react";
import { BusinessOwner } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { deleteBusinessOwner } from "@/services/businessOwner";
import { toast } from "sonner";

// Update the refetch parameter type to match what tanstack/react-query returns
export function useUserActions(refetchFn: () => Promise<unknown>) {
  const [selectedUser, setSelectedUser] = useState<BusinessOwner | null>(null);
  const [userToDelete, setUserToDelete] = useState<BusinessOwner | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const queryClient = useQueryClient();

  const handleEdit = (user: BusinessOwner) => {
    if (isProcessingAction) return;
    console.log("Editando proprietário:", user);
    setSelectedUser(user);
    setShowUserForm(true);
  };
  
  const handleDelete = (user: BusinessOwner | null) => {
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
          // Limpamos o usuário a ser excluído antes de qualquer outra operação
          setUserToDelete(null);
          
          // Invalidar o cache
          await queryClient.invalidateQueries({ queryKey: ['business-owners'] });
          
          // Forçar a atualização da lista diretamente
          await refetchFn();
          
          toast.success("Proprietário excluído com sucesso");
        } else {
          toast.error(result.error || "Não foi possível excluir o proprietário");
        }
      } catch (error) {
        toast.error("Erro ao excluir proprietário");
        console.error("Error deleting business owner:", error);
      } finally {
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
      
      // Fechar o formulário e resetar o usuário selecionado
      setShowUserForm(false);
      setSelectedUser(null);
      
      // Invalidar o cache e forçar a recarga dos dados
      await queryClient.invalidateQueries({ queryKey: ['business-owners'] });
      
      // Forçar a atualização da lista diretamente
      await refetchFn();
      
      toast.success("Proprietário salvo com sucesso");
    } finally {
      setIsProcessingAction(false);
    }
  };

  return {
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
  };
}
