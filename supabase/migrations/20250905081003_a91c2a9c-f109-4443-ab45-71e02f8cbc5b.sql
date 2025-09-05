-- Fix the function search path security warning
CREATE OR REPLACE FUNCTION public.sync_user_info_to_roles()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
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
$$;