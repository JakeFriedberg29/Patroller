-- Remove the orphaned enterprise_id foreign key constraint
-- This constraint references a column that was removed
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_enterprise_id_fkey;