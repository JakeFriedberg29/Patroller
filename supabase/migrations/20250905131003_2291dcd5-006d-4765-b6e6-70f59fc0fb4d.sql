-- Add email column to user_roles table right after user_id
ALTER TABLE public.user_roles 
ADD COLUMN email text;

-- Populate existing records with email from users table
UPDATE public.user_roles 
SET email = u.email 
FROM public.users u 
WHERE user_roles.user_id = u.id;

-- Create function to sync email changes
CREATE OR REPLACE FUNCTION public.sync_user_email_to_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update email in user_roles when user email changes
  IF TG_OP = 'UPDATE' AND OLD.email IS DISTINCT FROM NEW.email THEN
    UPDATE public.user_roles 
    SET email = NEW.email 
    WHERE user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on users table to sync email changes
CREATE TRIGGER sync_email_to_roles_trigger
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_email_to_roles();

-- Create function to set email when new user_roles are created
CREATE OR REPLACE FUNCTION public.set_user_role_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set email from users table when creating new user_role
  IF NEW.email IS NULL THEN
    SELECT email INTO NEW.email 
    FROM public.users 
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on user_roles table to set email on insert
CREATE TRIGGER set_user_role_email_trigger
  BEFORE INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_role_email();