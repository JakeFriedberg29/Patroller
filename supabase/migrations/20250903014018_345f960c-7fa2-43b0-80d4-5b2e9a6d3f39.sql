-- Update the profiles account_type constraint to include 'platform'
ALTER TABLE public.profiles 
DROP CONSTRAINT profiles_account_type_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_account_type_check 
CHECK (account_type IS NULL OR account_type = ANY (ARRAY['platform'::text, 'enterprise'::text, 'organization'::text]));