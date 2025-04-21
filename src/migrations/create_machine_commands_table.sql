
-- Criação da tabela de comandos de máquinas para registrar histórico
CREATE TABLE IF NOT EXISTS public.machine_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID REFERENCES public.machines(id) NOT NULL,
    command VARCHAR(50) NOT NULL,
    params JSONB,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Índices para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_machine_commands_machine_id ON public.machine_commands(machine_id);
CREATE INDEX IF NOT EXISTS idx_machine_commands_status ON public.machine_commands(status);

-- Adicionar campo para controlar sessão atual na tabela de máquinas
ALTER TABLE public.machines
ADD COLUMN IF NOT EXISTS current_session_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS current_payment_id UUID REFERENCES public.payments(id);

-- Adicionar política RLS
ALTER TABLE public.machine_commands ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura apenas para proprietários da lavanderia
CREATE POLICY "Allow read to laundry owners" ON public.machine_commands
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.machines m
        JOIN public.laundries l ON m.laundry_id = l.id
        WHERE m.id = machine_commands.machine_id
        AND l.owner_id = auth.uid()
    )
);

-- Criar política para permitir inserção apenas por administradores
CREATE POLICY "Allow insert to admin" ON public.machine_commands
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

COMMENT ON TABLE public.machine_commands IS 'Registra todos os comandos enviados às máquinas de lavar/secar';
