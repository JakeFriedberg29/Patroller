-- Fix the missing link between auth.users and public.users for platform admin
UPDATE public.users 
SET auth_user_id = 'c1e34289-5bdf-4e39-aa8f-4bd656e47782'
WHERE email = 'baha7uddin@gmail.com' AND auth_user_id IS NULL;

-- Verify the update
SELECT id, email, auth_user_id, full_name, status 
FROM public.users 
WHERE email = 'baha7uddin@gmail.com';