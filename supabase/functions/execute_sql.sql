
-- Function to execute raw SQL for admin operations
-- Note: This is a convenience function for development and should be secured in production
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;
