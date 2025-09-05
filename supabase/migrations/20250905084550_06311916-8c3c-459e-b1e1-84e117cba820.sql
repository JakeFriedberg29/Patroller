-- Create trigger to automatically create public.users records when auth.users are created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

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