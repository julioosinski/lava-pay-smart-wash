
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
}

export function LaundrySelection({ laundries, onLaundrySelect }: LaundrySelectionProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Selecione uma Lavanderia</h1>
      
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
              <p className="text-sm text-gray-500 mt-1">{laundry.contact_phone}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
