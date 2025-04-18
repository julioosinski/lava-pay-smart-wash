
import { LaundryLocation } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteLaundryDialogProps {
  laundry: LaundryLocation | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteLaundryDialog({ laundry, onClose, onConfirm }: DeleteLaundryDialogProps) {
  if (!laundry) return null;

  return (
    <AlertDialog open={!!laundry} onOpenChange={() => onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a lavanderia <strong>{laundry.name}</strong>? 
            Esta ação não pode ser desfeita e também excluirá todas as máquinas associadas a esta lavanderia.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
