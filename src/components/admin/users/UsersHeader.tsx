
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SearchBar } from "@/components/admin/SearchBar";

interface UsersHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onNewUser: () => void;
  isProcessing: boolean;
}

export function UsersHeader({ 
  searchQuery, 
  onSearchChange, 
  onNewUser,
  isProcessing 
}: UsersHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <SearchBar
        placeholder="Buscar proprietários..."
        value={searchQuery}
        onChange={onSearchChange}
      />
      <Button 
        className="bg-lavapay-500 hover:bg-lavapay-600"
        onClick={onNewUser}
        disabled={isProcessing}
      >
        <Plus className="mr-2 h-4 w-4" /> Novo Proprietário
      </Button>
    </div>
  );
}
