-- Fix generate_activation_token to use gen_random_uuid instead of gen_random_bytes
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
  -- Check user exists
  SELECT status INTO v_user_status
  FROM public.users
  WHERE id = p_user_id;

  IF v_user_status IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Generate secure activation token using UUID (more compatible than gen_random_bytes)
  v_activation_token := encode(gen_random_uuid()::text::bytea, 'base64');
  v_activation_token := replace(replace(replace(v_activation_token, '+', '-'), '/', '_'), '=', '');
  
  -- Append another UUID for extra length and security
  v_activation_token := v_activation_token || encode(gen_random_uuid()::text::bytea, 'base64');
  v_activation_token := replace(replace(replace(v_activation_token, '+', '-'), '/', '_'), '=', '');

  -- Update user with new activation token
  UPDATE public.users
  SET profile_data = jsonb_set(
    COALESCE(profile_data, '{}'::jsonb),
    '{activation_token}',
    to_jsonb(v_activation_token)
  ) || jsonb_build_object(
    'activation_token_expires', extract(epoch from (now() + interval '7 days'))
  )
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'activation_token', v_activation_token
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;