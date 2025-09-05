-- Create missing user record for existing auth user without public.users record
INSERT INTO public.users (
  auth_user_id,
  tenant_id, 
  organization_id,
  email,
  full_name,
  status,
  email_verified
) 
SELECT 
  au.id,
  (SELECT id FROM public.tenants LIMIT 1), -- Assign to first available tenant
  NULL,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  'active',
  COALESCE(au.email_confirmed_at IS NOT NULL, false)
FROM auth.users au
WHERE au.id NOT IN (SELECT auth_user_id FROM public.users WHERE auth_user_id IS NOT NULL);

-- Assign default member role to the new user
INSERT INTO public.user_roles (
  user_id,
  role_type,
  organization_id,
  is_active
)
SELECT 
  u.id,
  'member'::role_type,
  NULL,
  true
FROM public.users u
WHERE u.auth_user_id IN (
  SELECT au.id 
  FROM auth.users au
  WHERE au.id NOT IN (
    SELECT DISTINCT ur.user_id 
    FROM public.user_roles ur 
    JOIN public.users u2 ON ur.user_id = u2.id
  )
);