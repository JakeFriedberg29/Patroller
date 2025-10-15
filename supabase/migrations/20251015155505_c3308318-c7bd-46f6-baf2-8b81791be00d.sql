-- Fix activation token validation to match new field name and format
-- The generate_activation_token now stores 'activation_expires' as ISO timestamp
-- but the validation functions were still looking for 'activation_token_expires' as epoch

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
  -- Validate token using the correct field name 'activation_expires' with timestamptz cast
  SELECT u.*, u.profile_data->>'temp_password' as temp_password
  INTO v_user_record
  FROM public.users u
  WHERE u.profile_data->>'activation_token' = p_activation_token
    AND u.status = 'pending'::user_status
    AND (u.profile_data->>'activation_expires')::timestamptz > now();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired activation token');
  END IF;

  -- Create auth user using temp password stored at creation time
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    created_at,
    updated_at,
    raw_user_meta_data
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

  -- Activate application user and clear token/expiry
  UPDATE public.users 
  SET 
    auth_user_id = v_auth_user_id,
    status = 'active'::user_status,
    email_verified = true,
    profile_data = profile_data - 'activation_token' - 'activation_expires' - 'activation_token_expires'
  WHERE id = v_user_record.id;

  -- Audit log
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
  -- Validate token using the correct field name 'activation_expires' with timestamptz cast
  SELECT u.*
  INTO v_user_record
  FROM public.users u
  WHERE u.profile_data->>'activation_token' = p_activation_token
    AND u.status = 'pending'::user_status
    AND (u.profile_data->>'activation_expires')::timestamptz > now();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired activation token');
  END IF;

  -- Create auth user with provided password
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    created_at,
    updated_at,
    raw_user_meta_data
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

  -- Activate application user and clear token/expiry (both old and new field names)
  UPDATE public.users 
  SET 
    auth_user_id = v_auth_user_id,
    status = 'active'::user_status,
    email_verified = true,
    profile_data = profile_data - 'activation_token' - 'activation_expires' - 'activation_token_expires'
  WHERE id = v_user_record.id;

  -- Audit log
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