
import { useState } from "react";
import { BusinessOwner } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { deleteBusinessOwner } from "@/services/businessOwner";
import { toast } from "sonner";

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
          toast.success("Proprietário excluído com sucesso");
          
          // Limpar o usuário antes de qualquer outra operação
          setUserToDelete(null);
          
          // Forçar uma invalidação completa do cache
          queryClient.removeQueries({ queryKey: ['business-owners'] });
          
          // Forçar refetch dos dados com um pequeno delay para garantir a consistência
          setTimeout(async () => {
            try {
              await refetchFn();
              // Invalidar novamente para garantir dados frescos
              queryClient.invalidateQueries({ queryKey: ['business-owners'] });
            } catch (error) {
              console.error("Erro ao atualizar dados após exclusão:", error);
            }
          }, 500);
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
      
      toast.success("Proprietário salvo com sucesso");
      
      // Forçar uma invalidação completa do cache
      queryClient.removeQueries({ queryKey: ['business-owners'] });
      
      // Forçar refetch dos dados com um pequeno delay para garantir a consistência
      setTimeout(async () => {
        try {
          await refetchFn();
          // Invalidar novamente para garantir dados frescos
          queryClient.invalidateQueries({ queryKey: ['business-owners'] });
        } catch (error) {
          console.error("Erro ao atualizar dados após salvar:", error);
        }
      }, 500);
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
