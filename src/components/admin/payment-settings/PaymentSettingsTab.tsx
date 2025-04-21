import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Banknote, CreditCard } from "lucide-react";
import { MercadoPagoForm } from "./forms/MercadoPagoForm";
import { ElginForm } from "./forms/ElginForm";
import { usePaymentSettings } from "@/hooks/admin/usePaymentSettings";
import { PaymentProvider } from "@/types/payment-settings";

interface PaymentSettingsTabProps {
  laundryId: string;
}

export function PaymentSettingsTab({ laundryId }: PaymentSettingsTabProps) {
  const { settings, isLoading, updateSettings } = usePaymentSettings(laundryId);
  const [activeProvider, setActiveProvider] = useState<PaymentProvider>(settings?.provider || "mercado_pago");

  const handleMercadoPagoSubmit = async (data: any) => {
    try {
      await updateSettings({
        provider: "mercado_pago",
        ...data
      });
    } catch (error) {
      console.error("Erro ao atualizar configurações MercadoPago:", error);
    }
  };

  const handleElginSubmit = async (data: any) => {
    try {
      await updateSettings({
        provider: "elgin_tef",
        ...data
      });
    } catch (error) {
      console.error("Erro ao atualizar configurações Elgin:", error);
    }
  };

  if (isLoading) {
    return <div className="p-4">Carregando configurações...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Pagamento</CardTitle>
        <CardDescription>
          Configure as credenciais dos provedores de pagamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeProvider} onValueChange={setActiveProvider}>
          <TabsList className="mb-6">
            <TabsTrigger value="mercado_pago" className="flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              MercadoPago
            </TabsTrigger>
            <TabsTrigger value="elgin_tef" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Elgin TEF
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mercado_pago">
            <MercadoPagoForm
              initialData={settings}
              onSubmit={handleMercadoPagoSubmit}
            />
          </TabsContent>

          <TabsContent value="elgin_tef">
            <ElginForm
              initialData={settings}
              onSubmit={handleElginSubmit}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
