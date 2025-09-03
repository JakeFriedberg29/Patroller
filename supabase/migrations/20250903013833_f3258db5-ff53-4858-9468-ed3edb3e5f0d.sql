-- Fix the generate_activation_token function to use gen_random_uuid instead of gen_random_bytes
CREATE OR REPLACE FUNCTION public.generate_activation_token()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Use gen_random_uuid() and convert to hex string (removing hyphens)
  -- This generates a 32-character hex string which is secure and doesn't require pgcrypto extension
  RETURN replace(gen_random_uuid()::text, '-', '');
END;
$function$