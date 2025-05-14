
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/Layout';
import { EmailInput } from '@/components/auth/EmailInput';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { useAuthForm } from '@/hooks/use-auth-form';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { role?: string } | null;
  const role = state?.role || 'user';

  const [authType, setAuthType] = useState<'login' | 'register'>('login');
  const { 
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    isLogin, setIsLogin,
    loading, handleSubmit
  } = useAuthForm(role);

  console.log(`Auth page loaded with role: ${role}`);

  const handleDirectAdminAccess = () => {
    localStorage.setItem('direct_admin', 'true');
    navigate('/admin');
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>
              {role === 'admin' ? 'Acesso Administrativo' : 
               role === 'business' ? 'Acesso de Proprietário' : 
               'Acesso ao Sistema'}
            </CardTitle>
            <CardDescription>
              {role === 'admin' ? 'Entre com suas credenciais administrativas' :
               role === 'business' ? 'Entre para gerenciar suas lavanderias' :
               'Entre para usar o sistema de lavanderia'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {role === 'business' && (
              <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200">
                <InfoIcon className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Proprietários devem usar seu email como login e telefone como senha.
                </AlertDescription>
              </Alert>
            )}
            
            <Tabs value={authType} onValueChange={(value) => {
              setAuthType(value as 'login' | 'register');
              setIsLogin(value === 'login');
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Registro</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 pt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <EmailInput 
                    value={email} 
                    onChange={(e) => setEmail(e)} 
                  />
                  
                  <PasswordInput 
                    value={password} 
                    onChange={(e) => setPassword(e)}
                    showPassword={showPassword}
                    onToggleShow={() => setShowPassword(!showPassword)}
                    placeholder={role === 'business' ? "Digite seu telefone como senha" : "Digite sua senha"}
                  />
                  
                  <Button 
                    className="w-full" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? "Autenticando..." : "Entrar"}
                  </Button>
                </form>

                {role === 'admin' && (
                  <div className="mt-4 border-t pt-4">
                    <p className="text-sm text-gray-500 mb-2">Acesso de emergência:</p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleDirectAdminAccess}
                    >
                      Acessar Direto como Admin
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="register" className="space-y-4 pt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <EmailInput 
                    value={email} 
                    onChange={(e) => setEmail(e)} 
                  />
                  
                  <PasswordInput 
                    value={password} 
                    onChange={(e) => setPassword(e)}
                    showPassword={showPassword}
                    onToggleShow={() => setShowPassword(!showPassword)}
                    placeholder={role === 'business' ? "Digite seu telefone como senha" : "Digite sua senha"}
                  />
                  
                  <Button 
                    className="w-full" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? "Registrando..." : "Registrar"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col">
            {role === 'business' && (
              <p className="text-xs text-gray-500 w-full text-center mt-2">
                Se você é proprietário e não consegue entrar, entre em contato com o administrador do sistema.
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
