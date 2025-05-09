
-- Corrigir recursão infinita nos perfis dos usuários

-- Remover todas as políticas existentes que podem estar causando recursão
DROP POLICY IF EXISTS "Ver perfil próprio" ON public.profiles;
DROP POLICY IF EXISTS "Atualizar perfil próprio" ON public.profiles;
DROP POLICY IF EXISTS "Admin ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Admin atualizar todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem atualizar todos os perfis" ON public.profiles;

-- Reiniciar todas as políticas para as tabelas principais
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Simplificar política de acesso ao perfil
CREATE POLICY "Acesso ao perfil - SELECT" 
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Acesso ao perfil - UPDATE" 
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Corrigir a função is_admin para evitar recursão
CREATE OR REPLACE FUNCTION public.is_admin_safe()
RETURNS BOOLEAN
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  user_role text;
BEGIN
  -- Consulta direta sem usar RLS
  SELECT role::text INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN user_role = 'admin';
END;
$$;

-- Corrigir a função is_admin com parâmetro para evitar recursão
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  user_role text;
BEGIN
  -- Consulta direta sem usar RLS
  SELECT role::text INTO user_role
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN user_role = 'admin';
END;
$$;

-- Política para laundries
DROP POLICY IF EXISTS "Usuários podem ver suas próprias lavanderias" ON public.laundries;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias lavanderias" ON public.laundries;
DROP POLICY IF EXISTS "Usuários podem ver todas as lavanderias" ON public.laundries;

CREATE POLICY "Permitir acesso a todas as lavanderias" 
  ON public.laundries 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Política para máquinas
DROP POLICY IF EXISTS "Usuários podem ver todas as máquinas" ON public.machines;
DROP POLICY IF EXISTS "Máquinas são visíveis para todos" ON public.machines;

CREATE POLICY "Permitir acesso a todas as máquinas" 
  ON public.machines 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Garantir que as tabelas têm RLS ativo
ALTER TABLE public.laundries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
