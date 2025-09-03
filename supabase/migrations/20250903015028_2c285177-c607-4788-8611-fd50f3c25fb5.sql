-- Add missing columns to profiles table for enhanced admin management
ALTER TABLE public.profiles 
ADD COLUMN department text,
ADD COLUMN location text,
ADD COLUMN phone text,
ADD COLUMN permissions text[] DEFAULT '{}';

-- Add indexes for better query performance
CREATE INDEX idx_profiles_department ON public.profiles(department);
CREATE INDEX idx_profiles_location ON public.profiles(location);
CREATE INDEX idx_profiles_account_type_role ON public.profiles(account_type, role);

-- Update the create_pending_user function to support the new fields
CREATE OR REPLACE FUNCTION public.create_pending_user(
  user_email text, 
  user_full_name text, 
  user_role text DEFAULT 'user'::text, 
  user_account_id uuid DEFAULT NULL::uuid, 
  user_account_type text DEFAULT NULL::text,
  user_department text DEFAULT NULL::text,
  user_location text DEFAULT NULL::text,
  user_phone text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    department,
    location,
    phone,
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
    user_department,
    user_location,
    user_phone,
    'pending',
    activation_token_val,
    now(),
    true
  ) RETURNING user_id INTO new_user_id;
  
  RETURN new_user_id;
END;
$function$;