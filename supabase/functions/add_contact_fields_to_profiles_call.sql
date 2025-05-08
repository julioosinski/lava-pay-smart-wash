
-- Create a table to indirectly call the function
CREATE TABLE IF NOT EXISTS public.add_contact_fields_to_profiles_call (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dummy BOOLEAN
);

-- Create trigger that calls add_contact_fields_to_profiles() when any insert happens
CREATE OR REPLACE FUNCTION public.call_add_contact_fields_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.add_contact_fields_to_profiles();
  RETURN NEW;
END;
$$;

-- Add the trigger if it doesn't exist
DROP TRIGGER IF EXISTS call_add_contact_fields_trigger ON public.add_contact_fields_to_profiles_call;
CREATE TRIGGER call_add_contact_fields_trigger
AFTER INSERT ON public.add_contact_fields_to_profiles_call
FOR EACH ROW EXECUTE FUNCTION public.call_add_contact_fields_on_insert();

