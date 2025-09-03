-- Add activation status tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN activation_status TEXT DEFAULT 'pending' CHECK (activation_status IN ('pending', 'active', 'suspended')),
ADD COLUMN activation_token TEXT,
ADD COLUMN activation_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN activated_at TIMESTAMP WITH TIME ZONE;

-- Create index for activation queries
CREATE INDEX idx_profiles_activation_status ON public.profiles(activation_status);
CREATE INDEX idx_profiles_activation_token ON public.profiles(activation_token);

-- Function to generate activation token
CREATE OR REPLACE FUNCTION public.generate_activation_token()
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

-- Function to create pending user (called by admin)
CREATE OR REPLACE FUNCTION public.create_pending_user(
  user_email TEXT,
  user_full_name TEXT,
  user_role TEXT DEFAULT 'user',
  user_account_id UUID DEFAULT NULL,
  user_account_type TEXT DEFAULT NULL
)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  new_user_id UUID;
  activation_token_val TEXT;
BEGIN
  -- Generate activation token
  activation_token_val := generate_activation_token();
  
  -- Insert into profiles (this will be linked when user signs up)
  INSERT INTO public.profiles (
    user_id, 
    email, 
    full_name, 
    role, 
    account_id, 
    account_type,
    activation_status,
    activation_token,
    activation_sent_at,
    must_change_password
  ) VALUES (
    gen_random_uuid(), -- Temporary ID until actual signup
    user_email,
    user_full_name,
    user_role,
    user_account_id,
    user_account_type,
    'pending',
    activation_token_val,
    now(),
    true
  ) RETURNING user_id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$;

-- Function to activate user account
CREATE OR REPLACE FUNCTION public.activate_user_account(
  activation_token_param TEXT
)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  profile_record RECORD;
BEGIN
  -- Find and update the profile
  UPDATE public.profiles 
  SET 
    activation_status = 'active',
    activated_at = now(),
    activation_token = NULL
  WHERE activation_token = activation_token_param
  AND activation_status = 'pending'
  RETURNING * INTO profile_record;
  
  -- Return true if a record was updated
  RETURN FOUND;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.generate_activation_token() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_pending_user(TEXT, TEXT, TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_user_account(TEXT) TO authenticated;