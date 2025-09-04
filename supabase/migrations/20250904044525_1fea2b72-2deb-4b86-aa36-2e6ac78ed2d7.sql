-- Create function to create user with activation token (simplified)
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
  v_activation_token text;
  v_temp_password text;
  v_first_name text;
  v_last_name text;
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

  -- Parse name parts
  v_first_name := split_part(p_full_name, ' ', 1);
  v_last_name := CASE 
    WHEN position(' ' in p_full_name) > 0 
    THEN substring(p_full_name from position(' ' in p_full_name) + 1)
    ELSE ''
  END;

  -- Generate activation token
  v_activation_token := encode(gen_random_bytes(32), 'base64url');

  -- Create user in our users table only (no auth.users entry yet)
  INSERT INTO public.users (
    email,
    full_name,
    first_name,
    last_name,
    tenant_id,
    organization_id,
    phone,
    status,
    profile_data
  ) VALUES (
    p_email,
    p_full_name,
    v_first_name,
    v_last_name,
    p_tenant_id,
    p_organization_id,
    p_phone,
    'pending'::user_status,
    jsonb_build_object(
      'temp_password', v_temp_password,
      'activation_token', v_activation_token,
      'activation_expires', (now() + interval '24 hours')::text,
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