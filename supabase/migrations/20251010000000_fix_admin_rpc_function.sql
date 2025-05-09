
-- Criar uma função RPC para expor nossa função is_admin ao frontend
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users u
    JOIN public.profiles p ON u.id = p.id
    WHERE p.id = user_id AND p.role = 'admin'::user_role
  );
END;
$$;

-- Conceder permissão ao anon e authenticated para chamar essa função
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- Corrigir as políticas RLS da tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem atualizar todos os perfis" ON public.profiles;

-- Recriar as políticas de acesso para profiles de maneira mais segura
CREATE POLICY "Usuários podem ver seus próprios perfis" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Criar política para permitir leitura de profiles por admin
CREATE POLICY "Admins podem ver todos os perfis" 
  ON public.profiles 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

-- Criar política para permitir atualização de profiles por admin
CREATE POLICY "Admins podem atualizar todos os perfis" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));
