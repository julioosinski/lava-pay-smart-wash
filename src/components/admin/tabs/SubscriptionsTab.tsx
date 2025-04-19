
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash, Calendar, DollarSign } from "lucide-react";
import { SearchBar } from "../SearchBar";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useLaundries } from "@/hooks/useLaundries";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubscriptionForm } from "../SubscriptionForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LaundryLocation, Subscription } from "@/types";

interface SubscriptionsTabProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function SubscriptionsTab({ searchQuery, onSearchChange }: SubscriptionsTabProps) {
  const [selectedLaundryId, setSelectedLaundryId] = useState<string>("all");
  const { data: laundries = [] as LaundryLocation[] } = useLaundries();
  const { data: subscriptions = [], isLoading } = useSubscriptions(selectedLaundryId === "all" ? undefined : selectedLaundryId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  // Get laundry name by id
  const getLaundryName = (id: string) => {
    const laundry = laundries.find(l => l.id === id);
    return laundry ? laundry.name : id.substring(0, 8) + '...';
  };

  // Filter subscriptions based on search
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const laundryName = getLaundryName(subscription.laundry_id).toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    
    return laundryName.includes(searchLower) || 
           subscription.status.toLowerCase().includes(searchLower);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-grow">
          <SearchBar
            placeholder="Buscar mensalidades..."
            value={searchQuery}
            onChange={onSearchChange}
          />
          
          <div className="min-w-[200px]">
            <Select value={selectedLaundryId} onValueChange={setSelectedLaundryId}>
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
          </div>
        </div>
        
        {selectedLaundryId && selectedLaundryId !== "all" && (
          <SubscriptionForm laundryId={selectedLaundryId} />
        )}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lavanderia</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Dia de Cobrança</TableHead>
              <TableHead>Próxima Cobrança</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {selectedLaundryId !== "all" 
                    ? "Nenhuma mensalidade cadastrada para esta lavanderia"
                    : "Nenhuma mensalidade encontrada"}
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>{getLaundryName(subscription.laundry_id)}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-emerald-500" /> 
                      {formatCurrency(subscription.amount)}
                    </div>
                  </TableCell>
                  <TableCell>Dia {subscription.billing_day}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-blue-500" /> 
                      {formatDate(subscription.next_billing_date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subscription.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {subscription.status === 'active' ? 'Ativa' : 'Inativa'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 mr-1">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
