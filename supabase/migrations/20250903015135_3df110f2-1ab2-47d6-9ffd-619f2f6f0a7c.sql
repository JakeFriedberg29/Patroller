-- Enable leaked password protection in Supabase
-- This requires configuration through the Supabase dashboard
-- Adding this comment as a reminder since this can't be set via SQL

-- However, we can add additional database-level password security
-- by creating a function to check common leaked passwords
CREATE OR REPLACE FUNCTION public.check_password_common_leaks(password_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  is_common BOOLEAN := FALSE;
BEGIN
  -- Check against expanded list of commonly leaked passwords
  is_common := LOWER(password_text) IN (
    'password123', 'password1234', '123456789012', 'qwertyuiop12',
    'adminpassword', 'temppassword', 'defaultpassword', 'changepassword',
    'passwordpassword', '123456abcdef', 'abcdef123456', 'welcome12345',
    'letmein12345', 'password12345', 'administrator', 'welcome123456',
    'trustno1234', 'monkey123456', 'password1!', 'password123!',
    'sunshine1234', 'iloveyou1234', 'princess1234', 'football1234',
    'charlie12345', 'aa123456789', 'donald123456', 'password1@',
    'password@123', 'admin123456', 'root123456', 'user123456'
  );
  
  -- Return FALSE if password is commonly leaked, TRUE if it's safe
  RETURN NOT is_common;
END;
$function$;

-- Update the main password validation function to include leak check
CREATE OR REPLACE FUNCTION public.validate_password_strength(password_text text, user_email text DEFAULT NULL::text, user_name text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  has_upper BOOLEAN := password_text ~ '[A-Z]';
  has_lower BOOLEAN := password_text ~ '[a-z]';
  has_digit BOOLEAN := password_text ~ '[0-9]';
  has_special BOOLEAN := password_text ~ '[!@#$%^&*()_+\-=\[\]{};'':"\\|,.<>\/?~`]';
  has_repeated BOOLEAN := password_text ~ '(.)\1{2,}'; -- 3 or more repeated chars
  contains_email BOOLEAN := FALSE;
  contains_name BOOLEAN := FALSE;
  is_safe_from_leaks BOOLEAN := FALSE;
BEGIN
  -- Check minimum length
  IF LENGTH(password_text) < 12 THEN
    RETURN FALSE;
  END IF;

  -- Check character requirements
  IF NOT (has_upper AND has_lower AND has_digit AND has_special) THEN
    RETURN FALSE;
  END IF;

  -- Check for repeated characters (no more than 3 in a row)
  IF has_repeated THEN
    RETURN FALSE;
  END IF;

  -- Check if password contains email (case insensitive)
  IF user_email IS NOT NULL THEN
    contains_email := LOWER(password_text) LIKE '%' || LOWER(SPLIT_PART(user_email, '@', 1)) || '%';
    IF contains_email THEN
      RETURN FALSE;
    END IF;
  END IF;

  -- Check if password contains name (case insensitive)
  IF user_name IS NOT NULL THEN
    contains_name := LOWER(password_text) LIKE '%' || LOWER(user_name) || '%';
    IF contains_name THEN
      RETURN FALSE;
    END IF;
  END IF;

  -- Check against common leaked passwords
  is_safe_from_leaks := check_password_common_leaks(password_text);
  IF NOT is_safe_from_leaks THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$function$;