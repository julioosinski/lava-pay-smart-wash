
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { BusinessOwner } from "@/types";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface DeleteUserDialogProps {
  user: BusinessOwner | null;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export function DeleteUserDialog({ user, onClose, onConfirm, isProcessing = false }: DeleteUserDialogProps) {
  if (!user) return null;

  return (
    <AlertDialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Proprietário</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o proprietário <strong>{user.name || user.email || 'selecionado'}</strong>?
            <br />
            <br />
            Esta ação não pode ser desfeita e o proprietário não poderá mais acessar o sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isProcessing}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Excluir'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
