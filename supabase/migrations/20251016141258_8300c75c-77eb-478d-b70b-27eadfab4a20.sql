-- Remove specialization column from users table
ALTER TABLE public.users DROP COLUMN IF EXISTS specialization;