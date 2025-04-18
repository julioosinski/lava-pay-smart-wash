
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { WashingMachine, CreditCard, QrCode, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAdminAccess = () => {
    navigate('/auth', { state: { role: 'admin' } });
  };

  const handleOwnerAccess = () => {
    navigate('/auth', { state: { role: 'business' } });
  };

  return (
    <Layout>
      <div className="bg-gradient-to-b from-lavapay-600 to-lavapay-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">LavaPay Smart Wash</h1>
          <p className="text-xl md:max-w-2xl mx-auto mb-8">
            Transformando lavanderias automáticas com tecnologia de pagamento e automação inteligente
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to="/totem">
              <Button size="lg" className="bg-white text-lavapay-700 hover:bg-gray-100 font-semibold">
                Acessar Totem <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Como Funciona</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-2 border-lavapay-100">
            <CardHeader>
              <div className="h-16 w-16 rounded-full bg-lavapay-100 text-lavapay-600 flex items-center justify-center mx-auto mb-4">
                <WashingMachine className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-center">Escolha sua Máquina</h3>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Selecione uma máquina de lavar ou secar disponível no totem digital
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-lavapay-100">
            <CardHeader>
              <div className="h-16 w-16 rounded-full bg-lavapay-100 text-lavapay-600 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-center">Realize o Pagamento</h3>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Pague com cartão de crédito, débito ou PIX diretamente no terminal
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-lavapay-100">
            <CardHeader>
              <div className="h-16 w-16 rounded-full bg-lavapay-100 text-lavapay-600 flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-center">Máquina Liberada</h3>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Após a confirmação do pagamento, sua máquina será desbloqueada automaticamente
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Acesso ao Sistema</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="shadow-md">
              <CardHeader>
                <h3 className="text-xl font-bold">Painel do Proprietário</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Acesse o painel de controle para proprietários de lavanderias, onde você pode gerenciar suas máquinas, visualizar relatórios e monitorar os pagamentos.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleOwnerAccess} 
                  className="w-full bg-lavapay-500 hover:bg-lavapay-600"
                >
                  Acessar como Proprietário
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader>
                <h3 className="text-xl font-bold">Painel Administrativo</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Acesse o painel administrativo para gerenciar todas as lavanderias, usuários e configurações do sistema de automação.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleAdminAccess}
                  className="w-full bg-lavapay-500 hover:bg-lavapay-600"
                >
                  Acessar como Administrador
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

