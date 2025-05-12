
import { useBusinessOwners } from "@/hooks/useBusinessOwners";
import { useUserActions } from "@/hooks/admin/useUserActions";
import { UsersHeader } from "../users/UsersHeader";
import { UsersTable } from "../users/UsersTable";
import { UserForm } from "../UserForm";
import { DeleteUserDialog } from "../DeleteUserDialog";
import { BusinessOwner } from "@/types";

interface UsersTabProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function UsersTab({ searchQuery, onSearchChange }: UsersTabProps) {
  const { data: businessOwners = [], isLoading, refetch } = useBusinessOwners();
  
  // Pass the refetch function directly - it will be compatible with Promise<unknown>
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
    setSelectedUser
  } = useUserActions(refetch);
  
  // Make sure businessOwners is always an array before filtering
  const ownersArray = Array.isArray(businessOwners) ? businessOwners : [];
  
  const filteredUsers = ownersArray.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
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

      <UsersTable 
        users={filteredUsers}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isProcessing={isProcessingAction}
      />

      <DeleteUserDialog
        user={userToDelete}
        onClose={() => userToDelete && handleDelete(userToDelete)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
