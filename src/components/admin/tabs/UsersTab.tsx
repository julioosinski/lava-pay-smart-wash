
import { useBusinessOwners } from "@/hooks/useBusinessOwners";
import { useUserActions } from "@/hooks/admin/useUserActions";
import { UsersHeader } from "../users/UsersHeader";
import { UsersTable } from "../users/UsersTable";
import { UserForm } from "../UserForm";
import { DeleteUserDialog } from "../DeleteUserDialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface UsersTabProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function UsersTab({ searchQuery, onSearchChange }: UsersTabProps) {
  const isMobile = useIsMobile();
  const { data: businessOwners = [], isLoading, refetch } = useBusinessOwners();
  
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
          isLoading={isLoading}
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
