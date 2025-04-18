
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateMachine } from "@/hooks/useMachines";

export function MachineForm({ laundryId }: { laundryId: string }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const createMachine = useCreateMachine();

  const onSubmit = async (data: any) => {
    await createMachine.mutateAsync({
      ...data,
      laundry_id: laundryId,
      price: Number(data.price),
      time_minutes: Number(data.time_minutes)
    });
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Nova Máquina</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Nova Máquina</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select name="type" onValueChange={(value) => register("type").onChange({ target: { value } })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="washer">Lavadora</SelectItem>
                <SelectItem value="dryer">Secadora</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="price">Preço</Label>
            <Input id="price" type="number" step="0.01" {...register("price", { required: true })} />
          </div>
          <div>
            <Label htmlFor="time_minutes">Tempo (minutos)</Label>
            <Input id="time_minutes" type="number" {...register("time_minutes", { required: true })} />
          </div>
          <Button type="submit" className="w-full">
            Salvar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
