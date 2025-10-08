-- Create missing create_audit_log_partition function as an alias to audit_log_create_partition
-- The user_create_with_activation function expects this name

CREATE OR REPLACE FUNCTION public.create_audit_log_partition(p_year integer, p_month integer)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the existing audit_log_create_partition function
  RETURN public.audit_log_create_partition(p_year, p_month);
END;
$$;