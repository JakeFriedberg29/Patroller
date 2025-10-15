-- Make activation validators accept both expiry formats and
-- make generator enforce pending status and write both keys for compatibility

-- 1) Validators: accept activation_expires (ISO) OR activation_token_expires (epoch)
CREATE OR REPLACE FUNCTION public.activate_user_account(
  p_activation_token text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_record record;
  v_temp_password text;
  v_auth_user_id uuid;
BEGIN
  SELECT u.*, u.profile_data->>'temp_password' as temp_password
  INTO v_user_record
  FROM public.users u
  WHERE u.profile_data->>'activation_token' = p_activation_token
    AND u.status = 'pending'::user_status
    AND (
      (u.profile_data ? 'activation_expires' AND (u.profile_data->>'activation_expires')::timestamptz > now())
      OR
      (u.profile_data ? 'activation_token_expires' AND to_timestamp((u.profile_data->>'activation_token_expires')::double precision) > now())
    );

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired activation token');
  END IF;

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    confirmation_token, created_at, updated_at, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    v_user_record.email,
    crypt(v_user_record.temp_password, gen_salt('bf')),
    now(),
    NULL,
    now(),
    now(),
    jsonb_build_object('full_name', v_user_record.full_name)
  ) RETURNING id INTO v_auth_user_id;

  UPDATE public.users 
  SET 
    auth_user_id = v_auth_user_id,
    status = 'active'::user_status,
    email_verified = true,
    profile_data = profile_data - 'activation_token' - 'activation_expires' - 'activation_token_expires'
  WHERE id = v_user_record.id;

  INSERT INTO public.audit_logs (
    tenant_id, user_id, action, resource_type, resource_id, new_values, metadata
  ) VALUES (
    v_user_record.tenant_id,
    v_user_record.id,
    'ACTIVATE',
    'user',
    v_user_record.id,
    jsonb_build_object('status', 'active'),
    jsonb_build_object('method', 'activation_token')
  );

  RETURN jsonb_build_object(
    'success', true,
    'credentials', jsonb_build_object('email', v_user_record.email, 'password', v_user_record.temp_password)
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

CREATE OR REPLACE FUNCTION public.activate_user_account_with_password(
  p_activation_token text,
  p_password text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_record record;
  v_auth_user_id uuid;
BEGIN
  SELECT u.*
  INTO v_user_record
  FROM public.users u
  WHERE u.profile_data->>'activation_token' = p_activation_token
    AND u.status = 'pending'::user_status
    AND (
      (u.profile_data ? 'activation_expires' AND (u.profile_data->>'activation_expires')::timestamptz > now())
      OR
      (u.profile_data ? 'activation_token_expires' AND to_timestamp((u.profile_data->>'activation_token_expires')::double precision) > now())
    );

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired activation token');
  END IF;

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    confirmation_token, created_at, updated_at, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    v_user_record.email,
    crypt(p_password, gen_salt('bf')),
    now(),
    NULL,
    now(),
    now(),
    jsonb_build_object('full_name', v_user_record.full_name)
  ) RETURNING id INTO v_auth_user_id;

  UPDATE public.users 
  SET 
    auth_user_id = v_auth_user_id,
    status = 'active'::user_status,
    email_verified = true,
    profile_data = profile_data - 'activation_token' - 'activation_expires' - 'activation_token_expires'
  WHERE id = v_user_record.id;

  INSERT INTO public.audit_logs (
    tenant_id, user_id, action, resource_type, resource_id, new_values, metadata
  ) VALUES (
    v_user_record.tenant_id,
    v_user_record.id,
    'ACTIVATE',
    'user',
    v_user_record.id,
    jsonb_build_object('status', 'active'),
    jsonb_build_object('method', 'activation_token_with_password')
  );

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 2) Generator: enforce pending and write both expiry keys for backward compatibility
CREATE OR REPLACE FUNCTION public.generate_activation_token(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_activation_token text;
  v_user_status user_status;
BEGIN
  SELECT status INTO v_user_status
  FROM public.users
  WHERE id = p_user_id;

  IF v_user_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  IF v_user_status <> 'pending'::user_status THEN
    RETURN jsonb_build_object('success', false, 'error', 'User is not pending activation');
  END IF;

  -- Generate secure activation token
  v_activation_token := encode(gen_random_bytes(32), 'base64');
  v_activation_token := replace(replace(replace(v_activation_token, '+', '-'), '/', '_'), '=', '');

  UPDATE public.users
  SET profile_data = jsonb_set(
    COALESCE(profile_data, '{}'::jsonb),
    '{activation_token}',
    to_jsonb(v_activation_token)
  ) || jsonb_build_object(
    'activation_expires', (now() + interval '7 days')::text,
    'activation_token_expires', extract(epoch from (now() + interval '7 days'))
  )
  WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true, 'activation_token', v_activation_token);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;


