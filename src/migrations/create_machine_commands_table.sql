
CREATE TABLE IF NOT EXISTS public.machine_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id UUID NOT NULL REFERENCES public.machines(id),
  command TEXT NOT NULL,
  duration INTEGER,
  status TEXT NOT NULL DEFAULT 'sent',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  response TEXT
);

-- Add indexes
CREATE INDEX IF NOT EXISTS machine_commands_machine_id_idx ON public.machine_commands(machine_id);
CREATE INDEX IF NOT EXISTS machine_commands_status_idx ON public.machine_commands(status);

-- Add column to machines table for ESP32 identifier if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'machines' AND column_name = 'esp32_identifier') THEN
    ALTER TABLE public.machines ADD COLUMN esp32_identifier TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'machines' AND column_name = 'esp32_last_seen') THEN
    ALTER TABLE public.machines ADD COLUMN esp32_last_seen TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'machines' AND column_name = 'current_session_start') THEN
    ALTER TABLE public.machines ADD COLUMN current_session_start TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'machines' AND column_name = 'current_payment_id') THEN
    ALTER TABLE public.machines ADD COLUMN current_payment_id UUID REFERENCES public.payments(id);
  END IF;
END $$;

-- Add RLS policies for machine_commands
ALTER TABLE public.machine_commands ENABLE ROW LEVEL SECURITY;

-- Only users with access to the laundry can view commands
CREATE POLICY "Users with laundry access can view machine commands" ON public.machine_commands
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.machines m
      JOIN public.laundries l ON m.laundry_id = l.id
      WHERE m.id = machine_commands.machine_id
      AND (l.owner_id = auth.uid() OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
    )
  );

-- Only users with access to the laundry can insert commands
CREATE POLICY "Users with laundry access can insert machine commands" ON public.machine_commands
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.machines m
      JOIN public.laundries l ON m.laundry_id = l.id
      WHERE m.id = machine_commands.machine_id
      AND (l.owner_id = auth.uid() OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
    )
  );
