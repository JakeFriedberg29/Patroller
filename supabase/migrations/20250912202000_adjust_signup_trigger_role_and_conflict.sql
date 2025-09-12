-- Update handle_new_user_signup to avoid violating role check and to upsert roles
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_organization_id UUID;
  v_full_name TEXT;
  v_user_id UUID;
BEGIN
  v_tenant_id := (NEW.raw_user_meta_data->>'tenant_id')::UUID;
  v_organization_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);

  IF v_tenant_id IS NOT NULL THEN
    -- Upsert user row (avoid duplicate from manual creation)
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
      'pending',
      COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
    )
    ON CONFLICT (auth_user_id)
    DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      organization_id = EXCLUDED.organization_id,
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      status = LEAST(public.users.status, EXCLUDED.status)::user_status,
      email_verified = EXCLUDED.email_verified
    RETURNING id INTO v_user_id;

    -- Assign default member role only when no organization is specified (reduces conflicts)
    IF v_organization_id IS NULL THEN
      INSERT INTO public.user_roles (user_id, role_type, organization_id, is_active)
      VALUES (v_user_id, 'member', NULL, true)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
