
-- Criar uma função RPC para expor nossa função is_admin ao frontend
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT public.is_admin(user_id)
  );
END;
$$;

-- Conceder permissão ao anon e authenticated para chamar essa função
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- Adicionar política de INSERT para laundries
CREATE POLICY "Usuários podem inserir suas próprias lavanderias" 
  ON public.laundries 
  FOR INSERT 
  WITH CHECK (owner_id = auth.uid() OR public.is_admin(auth.uid()));

-- Adicionar política de INSERT para máquinas
CREATE POLICY "Usuários podem inserir máquinas em suas lavanderias" 
  ON public.machines 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.laundries
    WHERE laundries.id = machines.laundry_id
    AND (laundries.owner_id = auth.uid() OR public.is_admin(auth.uid()))
  ));

-- Adicionar política de UPDATE para máquinas
CREATE POLICY "Usuários podem atualizar máquinas de suas lavanderias" 
  ON public.machines 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.laundries
    WHERE laundries.id = machines.laundry_id
    AND (laundries.owner_id = auth.uid() OR public.is_admin(auth.uid()))
  ));

-- Política para payment_settings
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver configurações de pagamento de suas lavanderias" 
  ON public.payment_settings 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.laundries
    WHERE laundries.id = payment_settings.laundry_id
    AND (laundries.owner_id = auth.uid() OR public.is_admin(auth.uid()))
  ));

CREATE POLICY "Usuários podem atualizar configurações de pagamento de suas lavanderias" 
  ON public.payment_settings 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.laundries
    WHERE laundries.id = payment_settings.laundry_id
    AND (laundries.owner_id = auth.uid() OR public.is_admin(auth.uid()))
  ));
