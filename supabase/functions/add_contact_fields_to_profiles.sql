
-- Create function to add contact fields to profiles table if they don't exist
CREATE OR REPLACE FUNCTION public.add_contact_fields_to_profiles()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if contact_email column exists in profiles table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'contact_email'
  ) THEN
    -- Add contact_email column
    EXECUTE 'ALTER TABLE public.profiles ADD COLUMN contact_email text';
  END IF;

  -- Check if contact_phone column exists in profiles table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'contact_phone'
  ) THEN
    -- Add contact_phone column
    EXECUTE 'ALTER TABLE public.profiles ADD COLUMN contact_phone text';
  END IF;
END;
$$;
