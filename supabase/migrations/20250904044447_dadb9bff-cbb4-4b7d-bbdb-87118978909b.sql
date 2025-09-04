-- Create function to create user with activation token
CREATE OR REPLACE FUNCTION public.create_user_with_activation(
  p_email text,
  p_full_name text,
  p_tenant_id uuid,
  p_organization_id uuid DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_department text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_role_type role_type DEFAULT 'responder'::role_type
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_auth_user_id uuid;
  v_temp_password text;
  v_activation_token text;
BEGIN
  -- Generate temporary password (12 chars, meets requirements)
  v_temp_password := '';
  -- Add uppercase letter
  v_temp_password := v_temp_password || chr(65 + floor(random() * 26)::int);
  -- Add lowercase letter  
  v_temp_password := v_temp_password || chr(97 + floor(random() * 26)::int);
  -- Add number
  v_temp_password := v_temp_password || chr(48 + floor(random() * 10)::int);
  -- Add special character
  v_temp_password := v_temp_password || substr('!@#$%^&*', floor(random() * 8)::int + 1, 1);
  -- Fill remaining 8 characters
  FOR i IN 1..8 LOOP
    v_temp_password := v_temp_password || substr('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*', floor(random() * 70)::int + 1, 1);
  END LOOP;

  -- Create auth user first
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
    p_email,
    crypt(v_temp_password, gen_salt('bf')),
    NULL, -- Email not confirmed yet
    gen_random_uuid()::text,
    now(),
    now(),
    jsonb_build_object(
      'full_name', p_full_name,
      'temp_password', v_temp_password
    )
  ) RETURNING id INTO v_auth_user_id;

  -- Create user in our users table
  INSERT INTO public.users (
    auth_user_id,
    email,
    full_name,
    first_name,
    last_name,
    tenant_id,
    organization_id,
    phone,
    department_id,
    status,
    profile_data
  ) VALUES (
    v_auth_user_id,
    p_email,
    p_full_name,
    split_part(p_full_name, ' ', 1),
    CASE 
      WHEN array_length(string_to_array(p_full_name, ' '), 1) > 1 
      THEN array_to_string(string_to_array(p_full_name, ' ')[2:], ' ')
      ELSE ''
    END,
    p_tenant_id,
    p_organization_id,
    p_phone,
    NULL, -- We'll handle departments separately
    'pending'::user_status,
    jsonb_build_object(
      'temp_password', v_temp_password,
      'department', p_department,
      'location', p_location
    )
  ) RETURNING id INTO v_user_id;

  -- Assign role
  INSERT INTO public.user_roles (
    user_id,
    role_type,
    granted_by,
    organization_id
  ) VALUES (
    v_user_id,
    p_role_type,
    NULL, -- System created
    p_organization_id
  );

  -- Generate activation token
  v_activation_token := encode(gen_random_bytes(32), 'base64url');
  
  -- Store activation token in profile_data
  UPDATE public.users 
  SET profile_data = profile_data || jsonb_build_object(
    'activation_token', v_activation_token,
    'activation_expires', (now() + interval '24 hours')::text
  )
  WHERE id = v_user_id;

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
    p_tenant_id,
    NULL, -- System action
    'CREATE',
    'user',
    v_user_id,
    jsonb_build_object(
      'email', p_email,
      'full_name', p_full_name,
      'role_type', p_role_type
    ),
    jsonb_build_object('method', 'admin_invitation')
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'auth_user_id', v_auth_user_id,
    'activation_token', v_activation_token,
    'temp_password', v_temp_password
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Update activate_user_account function to return credentials
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

  -- Activate the user
  UPDATE public.users 
  SET 
    status = 'active'::user_status,
    email_verified = true,
    profile_data = profile_data - 'activation_token' - 'activation_expires'
  WHERE id = v_user_record.id;

  -- Confirm email in auth.users
  UPDATE auth.users 
  SET email_confirmed_at = now()
  WHERE id = v_user_record.auth_user_id;

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

-- Function to generate activation token for existing users
CREATE OR REPLACE FUNCTION public.generate_activation_token(
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_activation_token text;
  v_temp_password text;
BEGIN
  -- Generate new activation token
  v_activation_token := encode(gen_random_bytes(32), 'base64url');
  
  -- Get the temp password or generate a new one
  SELECT profile_data->>'temp_password' INTO v_temp_password
  FROM public.users 
  WHERE id = p_user_id;
  
  IF v_temp_password IS NULL THEN
    -- Generate new temporary password
    v_temp_password := '';
    -- Add required character types
    v_temp_password := v_temp_password || chr(65 + floor(random() * 26)::int); -- uppercase
    v_temp_password := v_temp_password || chr(97 + floor(random() * 26)::int); -- lowercase
    v_temp_password := v_temp_password || chr(48 + floor(random() * 10)::int); -- number
    v_temp_password := v_temp_password || substr('!@#$%^&*', floor(random() * 8)::int + 1, 1); -- special
    -- Fill remaining characters
    FOR i IN 1..8 LOOP
      v_temp_password := v_temp_password || substr('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*', floor(random() * 70)::int + 1, 1);
    END LOOP;
  END IF;

  -- Update user with new activation token
  UPDATE public.users 
  SET profile_data = profile_data || jsonb_build_object(
    'activation_token', v_activation_token,
    'activation_expires', (now() + interval '24 hours')::text,
    'temp_password', v_temp_password
  )
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'activation_token', v_activation_token,
    'temp_password', v_temp_password
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;