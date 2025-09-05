-- Add email and full_name columns to the existing user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS user_email text,
ADD COLUMN IF NOT EXISTS user_full_name text;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS sync_user_info_to_roles_trigger ON public.user_roles;

-- Create or replace the function to automatically populate these fields
CREATE OR REPLACE FUNCTION public.sync_user_info_to_roles()
RETURNS trigger AS $$
BEGIN
  -- Update the user info in user_roles when inserting/updating
  IF TG_OP = 'INSERT' THEN
    SELECT u.email, u.full_name 
    INTO NEW.user_email, NEW.user_full_name
    FROM public.users u 
    WHERE u.id = NEW.user_id;
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    SELECT u.email, u.full_name 
    INTO NEW.user_email, NEW.user_full_name
    FROM public.users u 
    WHERE u.id = NEW.user_id;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically sync user info
CREATE TRIGGER sync_user_info_to_roles_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_info_to_roles();

-- Populate existing rows with user info
UPDATE public.user_roles 
SET user_email = u.email, user_full_name = u.full_name
FROM public.users u 
WHERE user_roles.user_id = u.id;