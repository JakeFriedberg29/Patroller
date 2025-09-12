-- Fix create_user to explicitly set auth.users.id and upsert public.users
-- Avoids relying on defaults in auth schema and avoids duplicate inserts from signup trigger

CREATE OR REPLACE FUNCTION public.create_user(
  p_email TEXT,
  p_full_name TEXT,
  p_tenant_id UUID,
  p_organization_id UUID DEFAULT NULL,
  p_role_type role_type DEFAULT 'member',
  p_phone TEXT DEFAULT NULL,
  p_employee_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_auth_user_id UUID := gen_random_uuid();
BEGIN
  -- Create auth user first with explicit id
  INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    raw_user_meta_data
  ) VALUES (
    v_auth_user_id,
    p_email,
    now(),
    jsonb_build_object(
      'full_name', p_full_name,
      'tenant_id', p_tenant_id::text,
      'organization_id', p_organization_id::text
    )
  );

  -- Upsert public user record (signup trigger may also insert a pending row)
  INSERT INTO public.users (
    auth_user_id,
    tenant_id,
    organization_id,
    email,
    full_name,
    phone,
    employee_id,
    status,
    email_verified
  ) VALUES (
    v_auth_user_id,
    p_tenant_id,
    p_organization_id,
    p_email,
    p_full_name,
    p_phone,
    p_employee_id,
    'active',
    true
  )
  ON CONFLICT (auth_user_id)
  DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    organization_id = EXCLUDED.organization_id,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    employee_id = EXCLUDED.employee_id,
    status = EXCLUDED.status,
    email_verified = EXCLUDED.email_verified
  RETURNING id INTO v_user_id;

  -- Assign role (best-effort; ignore duplicates if constraint exists)
  INSERT INTO public.user_roles (
    user_id,
    role_type,
    organization_id,
    is_active
  ) VALUES (
    v_user_id,
    p_role_type,
    p_organization_id,
    true
  )
  ON CONFLICT DO NOTHING;

  -- Log the action
  INSERT INTO public.audit_logs (
    tenant_id,
    user_id,
    action,
    resource_type,
    resource_id,
    new_values
  ) VALUES (
    p_tenant_id,
    v_user_id,
    'CREATE',
    'user',
    v_user_id,
    jsonb_build_object(
      'email', p_email,
      'full_name', p_full_name,
      'role_type', p_role_type
    )
  );

  RETURN v_user_id;
END;
$$;


