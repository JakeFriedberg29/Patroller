-- Undo all database changes made during the conversation

-- Drop the trigger
DROP TRIGGER IF EXISTS sync_user_info_to_roles_trigger ON public.user_roles;

-- Drop the function
DROP FUNCTION IF EXISTS public.sync_user_info_to_roles();

-- Remove the added columns from user_roles table
ALTER TABLE public.user_roles 
DROP COLUMN IF EXISTS user_email,
DROP COLUMN IF EXISTS user_full_name;

-- Drop the view if it still exists
DROP VIEW IF EXISTS public.user_roles_with_details;