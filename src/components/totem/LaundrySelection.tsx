
import { LaundryLocation } from "@/types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Building } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface LaundrySelectionProps {
  laundries: LaundryLocation[];
  onLaundrySelect: (laundry: LaundryLocation) => void;
  loading?: boolean;
}

export function LaundrySelection({ laundries, onLaundrySelect, loading = false }: LaundrySelectionProps) {
  const isMobile = useIsMobile();

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Selecione uma Lavanderia</h1>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px] md:min-h-[300px]">
          <p className="text-gray-500">Carregando lavanderies...</p>
        </div>
      ) : laundries.length === 0 ? (
        <div className="text-center py-6 md:py-10">
          <p className="text-base md:text-lg text-gray-600 mb-4">Nenhuma lavanderia encontrada</p>
          <p className="text-sm text-gray-500">Você não tem acesso a nenhuma lavanderia no momento. Por favor, contate o administrador.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {laundries.map((laundry) => (
            <Card 
              key={laundry.id}
              className="cursor-pointer hover:border-lavapay-500 transition-colors"
              onClick={() => onLaundrySelect(laundry)}
            >
              <CardHeader className={`pb-2 ${isMobile ? 'p-4' : 'p-6'}`}>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Building className="h-5 w-5 text-lavapay-600" />
                  {laundry.name}
                </CardTitle>
              </CardHeader>
              <CardContent className={isMobile ? 'p-4' : 'p-6'}>
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
