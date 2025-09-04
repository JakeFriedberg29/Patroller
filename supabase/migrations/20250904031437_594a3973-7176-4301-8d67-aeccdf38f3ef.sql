-- =====================================================
-- ADD MISSING GENERATE_ACTIVATION_TOKEN FUNCTION
-- Function to generate activation token for existing users
-- =====================================================

-- Function to generate activation token for existing users
CREATE OR REPLACE FUNCTION public.generate_activation_token(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    v_activation_token TEXT;
BEGIN
    -- Generate new activation token
    v_activation_token := encode(gen_random_bytes(32), 'base64url');
    
    -- Update user with new token
    UPDATE public.users 
    SET profile_data = jsonb_set(
        COALESCE(profile_data, '{}'::jsonb),
        '{activation_token}',
        to_jsonb(v_activation_token)
    ) || jsonb_build_object(
        'activation_token_expires', extract(epoch from (now() + interval '7 days')),
        'token_generated_at', extract(epoch from now())
    ),
    updated_at = now()
    WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'activation_token', v_activation_token,
        'expires_at', extract(epoch from (now() + interval '7 days'))
    );
END;
$$;