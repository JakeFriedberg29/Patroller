-- Update activate_user_account function to create auth user on activation
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
  -- Find user by activation token
  SELECT u.*, u.profile_data->>'temp_password' as temp_password
  INTO v_user_record
  FROM public.users u
  WHERE u.profile_data->>'activation_token' = p_activation_token
    AND u.status = 'pending'::user_status
    AND (u.profile_data->>'activation_expires')::timestamptz > now();

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or expired activation token'
    );
  END IF;

  -- Create auth user now that activation is confirmed
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
    now(), -- Email confirmed since they clicked the activation link
    NULL,
    now(),
    now(),
    jsonb_build_object(
      'full_name', v_user_record.full_name
    )
  ) RETURNING id INTO v_auth_user_id;

  -- Update the user record with auth_user_id and activate
  UPDATE public.users 
  SET 
    auth_user_id = v_auth_user_id,
    status = 'active'::user_status,
    email_verified = true,
    profile_data = profile_data - 'activation_token' - 'activation_expires'
  WHERE id = v_user_record.id;

  -- Create audit log
  INSERT INTO public.audit_logs (
    tenant_id,
    user_id,
    action,
    resource_type,
    resource_id,
    new_values,
    metadata
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
    'credentials', jsonb_build_object(
      'email', v_user_record.email,
      'password', v_user_record.temp_password
    )
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;