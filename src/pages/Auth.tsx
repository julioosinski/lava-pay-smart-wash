
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

  // Este efeito redireciona o usuário se já estiver autenticado
  useEffect(() => {
    // Verificar flag de logout forçado primeiro
    const forcedLogout = localStorage.getItem('force_logout') === 'true';
    if (forcedLogout) {
      console.log("Flag de logout forçado detectada na página Auth, não redirecionando");
      localStorage.removeItem('force_logout');
      // Limpar token do Supabase para segurança extra
      localStorage.removeItem('sb-ftvvhclqjwtthquokzii-auth-token');
      return;
    }

    const checkSession = async () => {
      console.log("Verificando sessão na página Auth");
      // Não é necessário obter a sessão novamente já que estamos usando o user do contexto
      if (user) {
        console.log("Usuário já autenticado na página Auth, redirecionando");
        setIsRedirecting(true);
        
        try {
          // Verificar diretamente nos metadados do usuário
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser?.user_metadata?.role === 'admin') {
            console.log("Papel admin encontrado nos metadados, redirecionando para /admin");
            navigate('/admin', { replace: true });
            return;
          }
          
          // Verificar diretamente na tabela profiles
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
          
          const role = data?.role;
          console.log("Papel do usuário detectado na página Auth:", role);
          
          if (role === 'business') {
            console.log("Papel business detectado na página Auth, redirecionando para /owner");
            navigate('/owner', { replace: true });
          } else if (role === 'admin') {
            console.log("Papel admin detectado na página Auth, redirecionando para /admin");
            navigate('/admin', { replace: true });
          } else {
            console.log("Papel de usuário padrão na página Auth, redirecionando para home");
            navigate('/', { replace: true });
          }
        } catch (error) {
          console.error("Erro durante redirecionamento:", error);
          setIsRedirecting(false);
          toast.error("Erro ao redirecionar para a página correta");
        }
      }
    };
    
    checkSession();
  }, [navigate, user]);

  // Função para login direto como administrador (sem depender da tabela auth.users)
  const handleAdminBypass = async () => {
    setIsRedirecting(true);
    try {
      // Forçar uma flag no localStorage para simular um usuário admin logado
      localStorage.setItem('admin_bypass', 'true');
      localStorage.setItem('admin_bypass_timestamp', Date.now().toString());
      
      // Usar acesso admin diretamente sem depender da autenticação do Supabase
      toast.success("Acesso administrativo concedido!");
      navigate('/admin', { replace: true });
    } catch (error) {
      console.error("Erro no acesso administrativo direto:", error);
      toast.error("Falha no acesso administrativo");
      setIsRedirecting(false);
      // Limpar flag se falhar
      localStorage.removeItem('admin_bypass');
      localStorage.removeItem('admin_bypass_timestamp');
    }
  };

  // Tentar o login normal do Supabase como administrador
  const handleNormalAdminLogin = async () => {
    setIsRedirecting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@smartwash.com',
        password: 'admin123'
      });
      
      if (error) {
        console.error("Erro no login admin normal:", error);
        toast.error("Falha no login administrativo via Supabase");
        // Se falhar o login normal, usar o bypass
        handleAdminBypass();
      } else {
        toast.success("Login administrativo realizado com sucesso!");
      }
    } catch (error) {
      console.error("Erro na tentativa de login admin:", error);
      toast.error("Falha no login administrativo");
      setIsRedirecting(false);
    }
  };

  console.log("Página Auth carregada com papel:", expectedRole);

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
            
            {/* Botões de acesso administrativo especial */}
            {expectedRole === 'admin' && (
              <>
                <Button 
                  type="button" 
                  className="w-full bg-gray-700 hover:bg-gray-800 text-white"
                  onClick={handleNormalAdminLogin}
                  disabled={loading || isRedirecting}
                >
                  Login Admin Normal (admin@smartwash.com)
                </Button>
                
                <Button 
                  type="button" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleAdminBypass}
                  disabled={loading || isRedirecting}
                >
                  Acesso Admin Direto (Bypass)
                </Button>
              </>
            )}
            
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
