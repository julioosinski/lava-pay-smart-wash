
import { LaundryLocation } from "@/types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Building } from "lucide-react";

interface LaundrySelectionProps {
  laundries: LaundryLocation[];
  onLaundrySelect: (laundry: LaundryLocation) => void;
  loading?: boolean;
}

export function LaundrySelection({ laundries, onLaundrySelect, loading = false }: LaundrySelectionProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Selecione uma Lavanderia</h1>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <p className="text-gray-500">Carregando lavanderies...</p>
        </div>
      ) : laundries.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600 mb-4">Nenhuma lavanderia encontrada</p>
          <p className="text-sm text-gray-500">Por favor, tente novamente mais tarde ou contate o administrador</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {laundries.map((laundry) => (
            <Card 
              key={laundry.id}
              className="cursor-pointer hover:border-lavapay-500 transition-colors"
              onClick={() => onLaundrySelect(laundry)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-lavapay-600" />
                  {laundry.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{laundry.address}</p>
                <p className="text-sm text-gray-500 mt-1">{laundry.contact_phone || 'Sem telefone'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
