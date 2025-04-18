
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LaundryForm } from "./LaundryForm";
import { MachineForm } from "./MachineForm";
import { LaundryLocation, Machine } from "@/types";
import { Building2, WashingMachine } from "lucide-react";

interface EditLaundryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  laundry: LaundryLocation;
}

export function EditLaundryDialog({ open, onOpenChange, laundry }: EditLaundryDialogProps) {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar Lavanderia: {laundry.name}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="machines" className="flex items-center gap-2">
              <WashingMachine className="h-4 w-4" />
              Máquinas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <LaundryForm initialData={laundry} mode="edit" />
          </TabsContent>

          <TabsContent value="machines">
            <MachineForm laundryId={laundry.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
