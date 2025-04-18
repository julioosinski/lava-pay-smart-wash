
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { Machine } from "@/types";
import { MachineForm } from "../MachineForm";

interface TableActionsProps {
  machine: Machine;
  onDeleteClick: (machine: Machine) => void;
}

export function TableActions({ machine, onDeleteClick }: TableActionsProps) {
  return (
    <>
      <MachineForm
        laundryId={machine.laundry_id}
        machine={machine}
        variant="edit"
        triggerElement={
          <Button variant="ghost" size="icon" className="h-8 w-8 mr-1">
            <Edit className="h-4 w-4" />
          </Button>
        }
      />
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-red-500"
        onClick={() => onDeleteClick(machine)}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </>
  );
}
