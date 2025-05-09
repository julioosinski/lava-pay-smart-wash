
-- Criar um usuário administrador diretamente no banco de dados
-- Isso permite contornar os problemas de recursão infinita nas políticas RLS

-- Primeiro, vamos inserir o usuário na tabela auth.users com um email e senha padrão
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  email_confirmed_at,
  encrypted_password,
  aud,
  role,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@smartwash.com',
  now(),
  crypt('admin123', gen_salt('bf')),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin"}'
)
ON CONFLICT (email) DO NOTHING;

-- Agora, vamos criar/atualizar o perfil para o usuário admin inserido
INSERT INTO public.profiles (
  id,
  role,
  contact_email
)
SELECT
  id,
  'admin'::user_role,
  email
FROM
  auth.users
WHERE
  email = 'admin@smartwash.com'
ON CONFLICT (id) DO UPDATE
SET
  role = 'admin'::user_role;
