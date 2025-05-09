
-- Corrige a função is_admin para evitar problema de recursão
DROP FUNCTION IF EXISTS public.is_admin(uuid);

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
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

-- Conceder permissão ao anon e authenticated para chamar essa função
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- Atualizar as políticas para laundries para garantir acesso correto
DROP POLICY IF EXISTS "Usuários podem ver suas próprias lavanderias" ON public.laundries;
CREATE POLICY "Usuários podem ver suas próprias lavanderias" 
  ON public.laundries 
  FOR SELECT 
  USING (owner_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias lavanderias" ON public.laundries;
CREATE POLICY "Usuários podem atualizar suas próprias lavanderias" 
  ON public.laundries 
  FOR UPDATE 
  USING (owner_id = auth.uid() OR public.is_admin(auth.uid()));

-- Garantir que RLS está habilitado para todas as tabelas principais
ALTER TABLE public.laundries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
