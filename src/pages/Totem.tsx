
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MachineCard } from "@/components/MachineCard";
import { Machine } from "@/types";
import { mockMachines } from "@/lib/mockData";
import { 
  CreditCard, 
  Banknote, 
  QrCode, 
  ArrowLeft, 
  CheckCircle, 
  XCircle,
  Loader2,
  Lock
} from "lucide-react";
import { 
  generatePaymentToken,
  processCardPayment, 
  generatePixQRCode,
  activateMachine
} from "@/lib/mercadoPago";

const availableMachines = mockMachines.filter(machine => machine.status === "available");

export default function Totem() {
  const [step, setStep] = useState<"select-machine" | "payment" | "processing" | "success" | "error">("select-machine");
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "debit" | "pix">("credit");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixQRCode, setPixQRCode] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardholderName: "",
    expirationMonth: "",
    expirationYear: "",
    securityCode: ""
  });

  const handleMachineSelect = (machine: Machine) => {
    setSelectedMachine(machine);
    setStep("payment");
  };

  const handleBackToMachines = () => {
    setSelectedMachine(null);
    setStep("select-machine");
    setPixQRCode(null);
  };

  const handleBackToPayment = () => {
    setStep("payment");
    setIsProcessing(false);
    setPixQRCode(null);
  };

  const handleCardFieldChange = (field: string, value: string) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCardPayment = async () => {
    if (!selectedMachine) return;

    setIsProcessing(true);
    setStep("processing");

    try {
      // Simular processamento de pagamento
      const token = await generatePaymentToken(cardDetails);
      const payment = await processCardPayment(
        token,
        selectedMachine.price,
        `Pagamento ${selectedMachine.type === 'washer' ? 'Lavadora' : 'Secadora'} #${selectedMachine.id}`,
        "cliente@exemplo.com",
        selectedMachine.id
      );

      // Simular pequeno atraso adicional
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (payment.status === 'approved') {
        const activated = await activateMachine(selectedMachine.id);
        
        if (activated) {
          setStep("success");
        } else {
          setStep("error");
        }
      } else {
        setStep("error");
      }
    } catch (error) {
      console.error("Erro no pagamento:", error);
      setStep("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePixPayment = async () => {
    if (!selectedMachine) return;

    setIsProcessing(true);
    
    try {
      // Gerar QR Code PIX
      const pixData = await generatePixQRCode(
        selectedMachine.price,
        `Pagamento ${selectedMachine.type === 'washer' ? 'Lavadora' : 'Secadora'} #${selectedMachine.id}`,
        selectedMachine.id
      );
      
      setPixQRCode(pixData.qrCodeBase64);
      
      // Em uma implementação real, seria iniciado um polling para verificar o status do pagamento
      // Aqui vamos simular um pagamento bem-sucedido após alguns segundos
      setTimeout(async () => {
        const activated = await activateMachine(selectedMachine.id);
        
        if (activated) {
          setStep("success");
        } else {
          setStep("error");
        }
        
        setIsProcessing(false);
      }, 5000); // Simular 5 segundos para pagamento
      
    } catch (error) {
      console.error("Erro no pagamento PIX:", error);
      setStep("error");
      setIsProcessing(false);
    }
  };

  const isCardFormValid = () => {
    return (
      cardDetails.cardNumber.length >= 16 &&
      cardDetails.cardholderName.length >= 3 &&
      cardDetails.expirationMonth.length === 2 &&
      cardDetails.expirationYear.length === 2 &&
      cardDetails.securityCode.length >= 3
    );
  };

  const renderMachineSelection = () => (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Selecione uma Máquina</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {availableMachines.map((machine) => (
          <MachineCard 
            key={machine.id} 
            machine={machine} 
            onSelect={() => handleMachineSelect(machine)}
          />
        ))}
      </div>
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-2" 
          onClick={handleBackToMachines}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold">Escolha como pagar</h1>
      </div>
      
      {selectedMachine && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <p>
                {selectedMachine.type === 'washer' ? 'Lavadora' : 'Secadora'} #{selectedMachine.id}
                <span className="block text-sm text-gray-500">{selectedMachine.timeMinutes} minutos</span>
              </p>
              <p className="font-semibold text-lg">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(selectedMachine.price)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="credit" onValueChange={(value) => setPaymentMethod(value as any)}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="credit" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Crédito
          </TabsTrigger>
          <TabsTrigger value="debit" className="flex items-center gap-2">
            <Banknote className="h-4 w-4" /> Débito
          </TabsTrigger>
          <TabsTrigger value="pix" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" /> PIX
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="credit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cartão de Crédito</CardTitle>
              <CardDescription>Pague com seu cartão de crédito.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ccnumber">Número do Cartão</Label>
                <Input 
                  id="ccnumber" 
                  placeholder="0000 0000 0000 0000" 
                  value={cardDetails.cardNumber}
                  onChange={(e) => handleCardFieldChange("cardNumber", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ccname">Nome no Cartão</Label>
                <Input 
                  id="ccname" 
                  placeholder="Nome impresso no cartão" 
                  value={cardDetails.cardholderName}
                  onChange={(e) => handleCardFieldChange("cardholderName", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ccmonth">Mês</Label>
                  <Input 
                    id="ccmonth" 
                    placeholder="MM" 
                    maxLength={2}
                    value={cardDetails.expirationMonth}
                    onChange={(e) => handleCardFieldChange("expirationMonth", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ccyear">Ano</Label>
                  <Input 
                    id="ccyear" 
                    placeholder="AA" 
                    maxLength={2}
                    value={cardDetails.expirationYear}
                    onChange={(e) => handleCardFieldChange("expirationYear", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cccvv">CVV</Label>
                  <Input 
                    id="cccvv" 
                    placeholder="123" 
                    maxLength={4}
                    value={cardDetails.securityCode}
                    onChange={(e) => handleCardFieldChange("securityCode", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-lavapay-500 hover:bg-lavapay-600" 
                onClick={handleCardPayment}
                disabled={!isCardFormValid()}
              >
                Pagar com Crédito
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="debit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cartão de Débito</CardTitle>
              <CardDescription>Pague com seu cartão de débito.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dcnumber">Número do Cartão</Label>
                <Input 
                  id="dcnumber" 
                  placeholder="0000 0000 0000 0000" 
                  value={cardDetails.cardNumber}
                  onChange={(e) => handleCardFieldChange("cardNumber", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dcname">Nome no Cartão</Label>
                <Input 
                  id="dcname" 
                  placeholder="Nome impresso no cartão" 
                  value={cardDetails.cardholderName}
                  onChange={(e) => handleCardFieldChange("cardholderName", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dcmonth">Mês</Label>
                  <Input 
                    id="dcmonth" 
                    placeholder="MM" 
                    maxLength={2}
                    value={cardDetails.expirationMonth}
                    onChange={(e) => handleCardFieldChange("expirationMonth", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dcyear">Ano</Label>
                  <Input 
                    id="dcyear" 
                    placeholder="AA" 
                    maxLength={2}
                    value={cardDetails.expirationYear}
                    onChange={(e) => handleCardFieldChange("expirationYear", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dccvv">CVV</Label>
                  <Input 
                    id="dccvv" 
                    placeholder="123" 
                    maxLength={4}
                    value={cardDetails.securityCode}
                    onChange={(e) => handleCardFieldChange("securityCode", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-lavapay-500 hover:bg-lavapay-600"
                onClick={handleCardPayment}
                disabled={!isCardFormValid()}
              >
                Pagar com Débito
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="pix">
          <Card>
            <CardHeader>
              <CardTitle>Pagamento por PIX</CardTitle>
              <CardDescription>Escaneie o QR Code com o aplicativo do seu banco.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {pixQRCode ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="border-2 border-lavapay-100 p-4 rounded-md inline-block">
                    <img src={`data:image/png;base64,${pixQRCode}`} alt="QR Code PIX" className="h-48 w-48" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Escaneie o código acima com o aplicativo do seu banco ou carteira digital
                  </p>
                  <div className="flex items-center justify-center text-amber-600">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Aguardando pagamento...</span>
                  </div>
                </div>
              ) : (
                <div className="py-6">
                  <Button 
                    className="w-full bg-lavapay-500 hover:bg-lavapay-600" 
                    onClick={handlePixPayment}
                  >
                    Gerar QR Code PIX
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderProcessingPayment = () => (
    <div className="container mx-auto px-4 py-16 max-w-md text-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Processando Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="py-8 flex flex-col items-center">
          <Loader2 className="h-16 w-16 text-lavapay-600 animate-spin mb-6" />
          <p className="text-lg">Aguarde, estamos processando seu pagamento...</p>
          <p className="text-sm text-gray-500 mt-4">Não feche ou atualize esta página</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderPaymentSuccess = () => (
    <div className="container mx-auto px-4 py-16 max-w-md text-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Pagamento Confirmado!</CardTitle>
        </CardHeader>
        <CardContent className="py-8 flex flex-col items-center">
          <div className="rounded-full bg-green-100 p-4 mb-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <p className="text-lg mb-2">Sua máquina foi liberada com sucesso!</p>
          <p className="text-gray-500 mb-6">Você já pode utilizar o equipamento.</p>
          
          <div className="border border-gray-200 rounded-md p-4 bg-gray-50 mb-6 w-full">
            <p className="font-medium mb-1">Detalhes:</p>
            {selectedMachine && (
              <p className="text-gray-600">
                {selectedMachine.type === 'washer' ? 'Lavadora' : 'Secadora'} #{selectedMachine.id} - {selectedMachine.timeMinutes} minutos
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-lavapay-500 hover:bg-lavapay-600" 
            onClick={handleBackToMachines}
          >
            Voltar ao Início
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  const renderPaymentError = () => (
    <div className="container mx-auto px-4 py-16 max-w-md text-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Erro no Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="py-8 flex flex-col items-center">
          <div className="rounded-full bg-red-100 p-4 mb-6">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
          <p className="text-lg mb-2">Ocorreu um erro ao processar seu pagamento</p>
          <p className="text-gray-500 mb-6">Por favor, tente novamente ou escolha outro método de pagamento.</p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button 
            className="w-full bg-lavapay-500 hover:bg-lavapay-600" 
            onClick={handleBackToPayment}
          >
            Tentar Novamente
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleBackToMachines}
          >
            Escolher Outra Máquina
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  return (
    <Layout>
      {step === "select-machine" && renderMachineSelection()}
      {step === "payment" && renderPaymentMethods()}
      {step === "processing" && renderProcessingPayment()}
      {step === "success" && renderPaymentSuccess()}
      {step === "error" && renderPaymentError()}
    </Layout>
  );
}
