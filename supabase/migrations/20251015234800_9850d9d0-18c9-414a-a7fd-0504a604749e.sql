-- Create function to create a user with activation token
CREATE OR REPLACE FUNCTION public.user_create_with_activation(
  p_email text,
  p_full_name text,
  p_tenant_id uuid,
  p_organization_id uuid DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_role_type role_type DEFAULT 'patroller'::role_type
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_user_id uuid;
  v_token_result jsonb;
  v_first_name text;
  v_last_name text;
  v_temp_password text;
BEGIN
  -- Parse full name into first and last
  v_first_name := split_part(p_full_name, ' ', 1);
  v_last_name := trim(substring(p_full_name from length(v_first_name) + 2));
  
  -- Generate a temporary password for the user
  v_temp_password := encode(gen_random_bytes(16), 'base64');
  
  -- Create user in users table with status 'pending'
  INSERT INTO public.users (
    email,
    full_name,
    first_name,
    last_name,
    phone,
    tenant_id,
    organization_id,
    status,
    email_verified,
    profile_data
  ) VALUES (
    lower(trim(p_email)),
    p_full_name,
    v_first_name,
    v_last_name,
    p_phone,
    p_tenant_id,
    p_organization_id,
    'pending'::user_status,
    false,
    jsonb_build_object('temp_password', v_temp_password)
  )
  RETURNING id INTO v_user_id;
  
  -- Create role for the user
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
  );
  
  -- Generate activation token
  SELECT public.generate_activation_token(v_user_id) INTO v_token_result;
  
  IF NOT (v_token_result->>'success')::boolean THEN
    RAISE EXCEPTION 'Failed to generate activation token: %', v_token_result->>'error';
  END IF;
  
  -- Log the user creation
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
    v_user_id,
    'CREATE',
    'user',
    v_user_id,
    jsonb_build_object(
      'email', p_email,
      'full_name', p_full_name,
      'role_type', p_role_type
    ),
    jsonb_build_object('status', 'pending')
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'activation_token', v_token_result->>'activation_token'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$function$;