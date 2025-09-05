-- Fix the handle_new_user_signup function to handle manually created users
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_tenant_id UUID;
  v_organization_id UUID;
  v_full_name TEXT;
  v_user_id UUID;
  v_default_tenant_id UUID;
BEGIN
  -- Extract metadata from auth user
  v_tenant_id := (NEW.raw_user_meta_data->>'tenant_id')::UUID;
  v_organization_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);

  -- If no tenant_id in metadata (manually created user), assign to first available tenant
  IF v_tenant_id IS NULL THEN
    SELECT id INTO v_default_tenant_id FROM public.tenants ORDER BY created_at LIMIT 1;
    v_tenant_id := v_default_tenant_id;
  END IF;

  -- Only process if we have tenant information (either from metadata or default)
  IF v_tenant_id IS NOT NULL THEN
    -- Create public user record
    INSERT INTO public.users (
      auth_user_id,
      tenant_id,
      organization_id,
      email,
      full_name,
      status,
      email_verified
    ) VALUES (
      NEW.id,
      v_tenant_id,
      v_organization_id,
      NEW.email,
      v_full_name,
      'active',
      COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
    ) RETURNING id INTO v_user_id;

    -- Assign default member role
    INSERT INTO public.user_roles (
      user_id,
      role_type,
      organization_id,
      is_active
    ) VALUES (
      v_user_id,
      'member',
      v_organization_id,
      true
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Create missing user records for the newly created auth users
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
  (SELECT id FROM public.tenants ORDER BY created_at LIMIT 1),
  NULL,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  'active',
  COALESCE(au.email_confirmed_at IS NOT NULL, false)
FROM auth.users au
WHERE au.id NOT IN (SELECT auth_user_id FROM public.users WHERE auth_user_id IS NOT NULL);

-- Assign member roles to users without roles
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
WHERE u.id NOT IN (SELECT DISTINCT user_id FROM public.user_roles WHERE user_id IS NOT NULL);