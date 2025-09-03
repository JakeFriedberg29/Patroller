-- Fix search_path for password validation functions to address security warnings

-- Update validate_password_strength function with proper search_path
CREATE OR REPLACE FUNCTION public.validate_password_strength(
  password_text TEXT,
  user_email TEXT DEFAULT NULL,
  user_name TEXT DEFAULT NULL
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  has_upper BOOLEAN := password_text ~ '[A-Z]';
  has_lower BOOLEAN := password_text ~ '[a-z]';
  has_digit BOOLEAN := password_text ~ '[0-9]';
  has_special BOOLEAN := password_text ~ '[!@#$%^&*()_+\-=\[\]{};'':"\\|,.<>\/?~`]';
  has_repeated BOOLEAN := password_text ~ '(.)\1{2,}'; -- 3 or more repeated chars
  contains_email BOOLEAN := FALSE;
  contains_name BOOLEAN := FALSE;
  is_common BOOLEAN := FALSE;
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

  -- Check common passwords
  is_common := LOWER(password_text) IN (
    'password123', 'password1234', '123456789012', 'qwertyuiop12',
    'adminpassword', 'temppassword', 'defaultpassword', 'changepassword',
    'passwordpassword', '123456abcdef', 'abcdef123456', 'welcome12345'
  );
  
  IF is_common THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

-- Update check_password_history function with proper search_path
CREATE OR REPLACE FUNCTION public.check_password_history(
  user_id_param UUID,
  new_password_hash TEXT
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  history_count INTEGER;
BEGIN
  -- Check if the new password hash matches any of the last 5 passwords
  SELECT COUNT(*) INTO history_count
  FROM (
    SELECT password_hash 
    FROM public.password_history 
    WHERE user_id = user_id_param 
    ORDER BY created_at DESC 
    LIMIT 5
  ) recent_passwords
  WHERE password_hash = new_password_hash;
  
  -- Return TRUE if password is unique (count = 0), FALSE if it's been used recently
  RETURN history_count = 0;
END;
$$;

-- Update add_password_to_history function with proper search_path
CREATE OR REPLACE FUNCTION public.add_password_to_history(
  user_id_param UUID,
  password_hash_param TEXT
) RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Insert new password into history
  INSERT INTO public.password_history (user_id, password_hash)
  VALUES (user_id_param, password_hash_param);
  
  -- Keep only the last 5 passwords per user
  DELETE FROM public.password_history
  WHERE user_id = user_id_param
  AND id NOT IN (
    SELECT id 
    FROM public.password_history 
    WHERE user_id = user_id_param 
    ORDER BY created_at DESC 
    LIMIT 5
  );
END;
$$;

-- Update update_password_expiration function with proper search_path
CREATE OR REPLACE FUNCTION public.update_password_expiration(
  user_id_param UUID
) RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    password_expires_at = now() + interval '12 months',
    password_changed_at = now(),
    must_change_password = false
  WHERE user_id = user_id_param;
END;
$$;

-- Update is_password_expired function with proper search_path
CREATE OR REPLACE FUNCTION public.is_password_expired(
  user_id_param UUID
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  expiry_date TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT password_expires_at INTO expiry_date
  FROM public.profiles 
  WHERE user_id = user_id_param;
  
  -- If no expiry date found, assume expired for security
  IF expiry_date IS NULL THEN
    RETURN TRUE;
  END IF;
  
  RETURN now() > expiry_date;
END;
$$;