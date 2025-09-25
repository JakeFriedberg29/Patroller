-- Remove department_id column from users table (foreign key)
ALTER TABLE public.users DROP COLUMN IF EXISTS department_id;

-- Drop departments table completely
DROP TABLE IF EXISTS public.departments;