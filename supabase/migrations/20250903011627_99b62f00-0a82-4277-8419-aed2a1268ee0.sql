-- Create password history table to track last 5 passwords
CREATE TABLE public.password_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on password history
ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own password history (for validation)
CREATE POLICY "Users can view their own password history" 
ON public.password_history 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add password expiration tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN password_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '12 months'),
ADD COLUMN password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN must_change_password BOOLEAN DEFAULT false;

-- Function to validate password strength
CREATE OR REPLACE FUNCTION public.validate_password_strength(
  password_text TEXT,
  user_email TEXT DEFAULT NULL,
  user_name TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check password history (prevent reuse of last 5 passwords)
CREATE OR REPLACE FUNCTION public.check_password_history(
  user_id_param UUID,
  new_password_hash TEXT
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add password to history
CREATE OR REPLACE FUNCTION public.add_password_to_history(
  user_id_param UUID,
  password_hash_param TEXT
) RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update password expiration
CREATE OR REPLACE FUNCTION public.update_password_expiration(
  user_id_param UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    password_expires_at = now() + interval '12 months',
    password_changed_at = now(),
    must_change_password = false
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if password is expired
CREATE OR REPLACE FUNCTION public.is_password_expired(
  user_id_param UUID
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for better performance
CREATE INDEX idx_password_history_user_created ON public.password_history(user_id, created_at DESC);
CREATE INDEX idx_profiles_password_expires ON public.profiles(password_expires_at);

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.validate_password_strength(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_password_history(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_password_to_history(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_password_expiration(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_password_expired(UUID) TO authenticated;