
-- Adicionar funções seguras para verificação de papéis

-- Função para obter o papel do usuário de forma segura
CREATE OR REPLACE FUNCTION public.get_user_role_safely(user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role::text FROM profiles WHERE id = user_id;
$$;

-- Função para verificar se o usuário é admin de forma segura
CREATE OR REPLACE FUNCTION public.is_user_admin_safely(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role = 'admin'::user_role FROM profiles WHERE id = user_id;
$$;

-- Conceder permissão de execução para usuários anônimos e autenticados
GRANT EXECUTE ON FUNCTION public.get_user_role_safely(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_role_safely(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_admin_safely(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.is_user_admin_safely(UUID) TO authenticated;
