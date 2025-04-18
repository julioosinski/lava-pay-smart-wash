
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { WashingMachine } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { EmailInput } from '@/components/auth/EmailInput';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { useAuthForm } from '@/hooks/use-auth-form';
import { toast } from 'sonner';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const expectedRole = location.state?.role || 'user';
  
  const {
    isLogin,
    email,
    password,
    showPassword,
    loading,
    setIsLogin,
    setEmail,
    setPassword,
    setShowPassword,
    handleSubmit,
  } = useAuthForm(expectedRole);

  // This effect redirects the user if they're already authenticated
  useEffect(() => {
    const checkSession = async () => {
      console.log("Checking session in Auth page");
      // No need to get the session again as we're using the user from context
      if (user) {
        console.log("User already authenticated in Auth page, redirecting");
        setIsRedirecting(true);
        
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        const role = data?.role;
        console.log("User role detected in Auth page:", role);
        
        try {
          if (role === 'business') {
            console.log("Business role detected in Auth page, redirecting to /owner");
            navigate('/owner', { replace: true });
          } else if (role === 'admin') {
            console.log("Admin role detected in Auth page, redirecting to /admin");
            navigate('/admin', { replace: true });
          } else {
            console.log("Standard user role in Auth page, redirecting to home");
            navigate('/', { replace: true });
          }
        } catch (error) {
          console.error("Error during redirection:", error);
          setIsRedirecting(false);
          toast.error("Erro ao redirecionar para a página correta");
        }
      }
    };
    
    checkSession();
  }, [navigate, user]);

  useEffect(() => {
    if (user) {
      console.log("User object changed in Auth page:", user.id);
    }
  }, [user]);

  console.log("Auth page loaded with role:", expectedRole);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <WashingMachine className="h-12 w-12 text-lavapay-600 mb-2" />
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? 'Entrar' : 'Criar conta'} {expectedRole === 'admin' ? 'como Administrador' : expectedRole === 'business' ? 'como Proprietário' : ''}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin 
              ? 'Entre com suas credenciais para acessar o sistema'
              : 'Crie sua conta para começar a usar o sistema'}
          </CardDescription>
          
          {expectedRole === 'business' && isLogin && (
            <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
              <p className="font-medium mb-1">⚠️ Atenção proprietários:</p>
              <p>Use o <strong>e-mail de contato</strong> da sua lavanderia como usuário e o <strong>telefone de contato</strong> como senha.</p>
            </div>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <EmailInput value={email} onChange={setEmail} />
            </div>
            <div className="space-y-2">
              <PasswordInput
                value={password}
                onChange={setPassword}
                showPassword={showPassword}
                onToggleShow={() => setShowPassword(!showPassword)}
                label={expectedRole === 'business' && isLogin ? "Telefone" : "Senha"}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-lavapay-600 hover:bg-lavapay-700"
              disabled={loading || isRedirecting}
            >
              {loading || isRedirecting ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar conta')}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => setIsLogin(!isLogin)}
              disabled={loading || isRedirecting}
            >
              {isLogin 
                ? 'Não tem uma conta? Criar conta'
                : 'Já tem uma conta? Fazer login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
