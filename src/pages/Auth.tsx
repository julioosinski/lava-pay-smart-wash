import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { WashingMachine } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EmailInput } from '@/components/auth/EmailInput';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { useAuthForm } from '@/hooks/use-auth-form';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
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

  useEffect(() => {
    const checkSession = async () => {
      console.log("Checking session in Auth page");
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("Session found in Auth page, checking role for redirection");
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (data?.role === 'business') {
          navigate('/owner', { replace: true });
        } else if (data?.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        console.log("No session found in Auth page");
      }
    };
    checkSession();
  }, [navigate]);

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
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-lavapay-600 hover:bg-lavapay-700"
              disabled={loading}
            >
              {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar conta')}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => setIsLogin(!isLogin)}
              disabled={loading}
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
