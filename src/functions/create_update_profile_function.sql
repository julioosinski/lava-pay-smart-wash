
-- Create this function in Supabase SQL editor
CREATE OR REPLACE FUNCTION public.update_profile_safely(
  profile_id UUID,
  contact_phone_val TEXT DEFAULT NULL,
  contact_email_val TEXT DEFAULT NULL,
  role_val TEXT DEFAULT NULL,
  first_name_val TEXT DEFAULT NULL,
  last_name_val TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    contact_phone = COALESCE(contact_phone_val, contact_phone),
    contact_email = COALESCE(contact_email_val, contact_email),
    role = COALESCE(role_val::user_role, role),
    first_name = COALESCE(first_name_val, first_name),
    last_name = COALESCE(last_name_val, last_name),
    updated_at = NOW()
  WHERE id = profile_id;
END;
$$;
