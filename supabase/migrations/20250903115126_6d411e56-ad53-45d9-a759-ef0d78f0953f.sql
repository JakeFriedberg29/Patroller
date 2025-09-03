-- Drop the existing constraint that expects underscore format
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint that accepts the display format used in the application
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('Platform Admin', 'Enterprise Admin', 'Organization Admin', 'user'));