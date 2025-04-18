
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { WashingMachine, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const expectedRole = location.state?.role || 'user';

  useEffect(() => {
    const checkSession = async () => {
      console.log("Checking session in Auth page");
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("Session found, redirecting based on role");
        redirectBasedOnRole(session.user.id);
      } else {
        console.log("No session found");
      }
    };
    checkSession();
  }, []);

  // Add an effect to check user value changes
  useEffect(() => {
    if (user) {
      console.log("User object changed in Auth page:", user.id);
      redirectBasedOnRole(user.id);
    }
  }, [user]);

  const redirectBasedOnRole = async (userId: string) => {
    try {
      console.log("Checking role for user:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching role:", error);
        throw error;
      }

      console.log("User role data:", data);
      console.log("Expected role:", expectedRole);

      // First check if we're specifically trying to log in as a role type
      if (expectedRole === 'admin' && data?.role === 'admin') {
        console.log("Admin role verified, redirecting to admin");
        navigate('/admin');
        return;
      } 
      
      if (expectedRole === 'business' && data?.role === 'business') {
        console.log("Business owner role verified, redirecting to owner dashboard");
        navigate('/owner');
        return;
      }

      // If no specific expected role or no match with expected role, 
      // redirect based on what the user actually is
      if (data?.role === 'admin') {
        console.log("Admin detected, redirecting to admin dashboard");
        navigate('/admin');
      } else if (data?.role === 'business') {
        console.log("Business owner detected, redirecting to owner dashboard");
        navigate('/owner');
      } else {
        console.log("Regular user or unknown role, redirecting to home");
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      toast({
        variant: "destructive",
        title: "Erro ao verificar permissões",
        description: "Não foi possível verificar seu perfil de usuário."
      });
      navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        console.log("Attempting login with email:", email);
        await signIn(email, password);
        // Redirection will be handled by useEffect that watches the user state
        
        // Also check session directly to ensure we have latest data
        setTimeout(async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && !user) {
            console.log("Session exists but user state not updated yet, redirecting manually");
            redirectBasedOnRole(session.user.id);
          }
        }, 500);
      } else {
        await signUp(email, password);
        toast({
          title: "Registro realizado com sucesso!",
          description: "Verifique seu email para confirmar o cadastro.",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Auth error:", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro durante a autenticação",
      });
    }
  };

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
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
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
