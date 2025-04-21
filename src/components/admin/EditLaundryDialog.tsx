
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LaundryForm } from "./LaundryForm";
import { MachineForm } from "./machines/MachineForm";
import { LaundryLocation } from "@/types";
import { Building2, WashingMachine, CreditCard } from "lucide-react";
import { MachineCard } from "@/components/MachineCard";
import { useMachines } from "@/hooks/useMachines";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { PaymentSettingsTab } from "./payment-settings/PaymentSettingsTab";

interface EditLaundryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  laundry: LaundryLocation;
}

export function EditLaundryDialog({ open, onOpenChange, laundry }: EditLaundryDialogProps) {
  const [activeTab, setActiveTab] = useState("details");
  const { data: machines = [] } = useMachines(laundry.id);
  const queryClient = useQueryClient();

  const handleFormSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ['laundries'] });
    await queryClient.invalidateQueries({ queryKey: ['machines', laundry.id] });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95%] max-h-[90vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">Editar Lavanderia: {laundry.name}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full flex flex-wrap gap-2">
            <TabsTrigger value="details" className="flex-1 flex items-center gap-2 min-w-[120px]">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Detalhes</span>
            </TabsTrigger>
            <TabsTrigger value="machines" className="flex-1 flex items-center gap-2 min-w-[120px]">
              <WashingMachine className="h-4 w-4" />
              <span className="hidden sm:inline">Máquinas</span>
            </TabsTrigger>
            <TabsTrigger value="payment-settings" className="flex-1 flex items-center gap-2 min-w-[120px]">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Pagamentos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <LaundryForm 
              initialData={laundry} 
              mode="edit" 
              onSuccess={handleFormSuccess}
            />
          </TabsContent>

          <TabsContent value="machines">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold">Máquinas</CardTitle>
                <MachineForm 
                  laundryId={laundry.id} 
                  onSuccess={handleFormSuccess}
                />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {machines.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      Nenhuma máquina cadastrada. Adicione uma nova máquina.
                    </div>
                  ) : (
                    machines.map((machine) => (
                      <MachineCard 
                        key={machine.id} 
                        machine={machine} 
                        showActions={false}
                        showEdit={true}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment-settings">
            <PaymentSettingsTab laundryId={laundry.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
