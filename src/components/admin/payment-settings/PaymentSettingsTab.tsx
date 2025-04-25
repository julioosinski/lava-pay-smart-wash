import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Banknote, CreditCard, Landmark, Terminal } from "lucide-react";
import { MercadoPagoForm } from "./forms/MercadoPagoForm";
import { ElginForm } from "./forms/ElginForm";
import { StoneForm } from "./forms/StoneForm";
import { PaygoForm } from "./forms/PaygoForm";
import { usePaymentSettings } from "@/hooks/admin/usePaymentSettings";
import { PaymentProvider } from "@/types/payment-settings";

interface PaymentSettingsTabProps {
  laundryId: string;
}

export function PaymentSettingsTab({ laundryId }: PaymentSettingsTabProps) {
  const { settings, isLoading, updateSettings } = usePaymentSettings(laundryId);
  const [activeProvider, setActiveProvider] = useState<PaymentProvider>(
    (settings?.provider as PaymentProvider) || "mercado_pago"
  );

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

  const handleStoneSubmit = async (data: any) => {
    try {
      await updateSettings({
        provider: "stone",
        ...data
      });
    } catch (error) {
      console.error("Erro ao atualizar configurações Stone:", error);
    }
  };

  const handlePaygoSubmit = async (data: any) => {
    try {
      await updateSettings({
        provider: "paygo_tef",
        ...data
      });
    } catch (error) {
      console.error("Erro ao atualizar configurações PayGo:", error);
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
        <Tabs 
          defaultValue={activeProvider} 
          onValueChange={(value) => setActiveProvider(value as PaymentProvider)}
        >
          <TabsList className="mb-6">
            <TabsTrigger value="mercado_pago" className="flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              MercadoPago
            </TabsTrigger>
            <TabsTrigger value="elgin_tef" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Elgin TEF
            </TabsTrigger>
            <TabsTrigger value="stone" className="flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              Stone
            </TabsTrigger>
            <TabsTrigger value="paygo_tef" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              PayGo TEF
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

          <TabsContent value="stone">
            <StoneForm
              initialData={settings}
              onSubmit={handleStoneSubmit}
            />
          </TabsContent>

          <TabsContent value="paygo_tef">
            <PaygoForm
              initialData={settings}
              onSubmit={handlePaygoSubmit}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
