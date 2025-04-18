
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LaundryLocation } from "@/types";
import { MachineForm } from "./MachineForm";

interface MachinesFilterProps {
  selectedLaundryId: string;
  onLaundryChange: (id: string) => void;
  laundries: LaundryLocation[];
}

export function MachinesFilter({ selectedLaundryId, onLaundryChange, laundries }: MachinesFilterProps) {
  return (
    <div className="min-w-[200px] flex items-center gap-4">
      <Select value={selectedLaundryId} onValueChange={onLaundryChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por lavanderia" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as lavanderias</SelectItem>
          {laundries.map(laundry => (
            <SelectItem key={laundry.id} value={laundry.id}>
              {laundry.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedLaundryId && selectedLaundryId !== "all" && (
        <MachineForm laundryId={selectedLaundryId} />
      )}
    </div>
  );
}
