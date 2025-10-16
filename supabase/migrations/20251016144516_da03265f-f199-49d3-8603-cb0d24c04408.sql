-- Ensure proper cascade delete constraints for user deletion

-- First, drop existing foreign key constraint on user_roles if it exists
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Add foreign key constraint with CASCADE DELETE
ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(id) 
ON DELETE CASCADE;

-- Ensure account_users also cascades on user deletion
ALTER TABLE public.account_users
DROP CONSTRAINT IF EXISTS account_users_user_id_fkey;

ALTER TABLE public.account_users
ADD CONSTRAINT account_users_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;