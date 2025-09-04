-- =====================================================
-- FIX ACTIVATION TOKEN GENERATION 
-- Use base64 encoding instead of base64url
-- =====================================================

-- Update the generate_activation_token function to use base64 encoding
CREATE OR REPLACE FUNCTION public.generate_activation_token(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    v_activation_token TEXT;
BEGIN
    -- Generate new activation token using base64 encoding
    v_activation_token := encode(gen_random_bytes(32), 'base64');
    
    -- Remove any characters that might cause URL issues
    v_activation_token := replace(replace(replace(v_activation_token, '+', '-'), '/', '_'), '=', '');
    
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

-- Also fix the create_pending_user function to use base64
CREATE OR REPLACE FUNCTION public.create_pending_user(
    p_email text,
    p_full_name text,
    p_tenant_id uuid,
    p_organization_id uuid DEFAULT NULL,
    p_role_type role_type DEFAULT 'responder',
    p_phone text DEFAULT NULL,
    p_department text DEFAULT NULL,
    p_location text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    v_user_id UUID;
    v_activation_token TEXT;
BEGIN
    -- Generate activation token using base64
    v_activation_token := encode(gen_random_bytes(32), 'base64');
    v_activation_token := replace(replace(replace(v_activation_token, '+', '-'), '/', '_'), '=', '');
    
    -- Create pending user record
    INSERT INTO public.users (
        tenant_id,
        organization_id,
        email,
        full_name,
        phone,
        status,
        email_verified,
        profile_data
    ) VALUES (
        p_tenant_id,
        p_organization_id,
        p_email,
        p_full_name,
        p_phone,
        'pending',
        false,
        jsonb_build_object(
            'activation_token', v_activation_token,
            'activation_token_expires', extract(epoch from (now() + interval '7 days')),
            'department', p_department,
            'location', p_location,
            'created_by_admin', true
        )
    ) RETURNING id INTO v_user_id;

    -- Assign role
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

    -- Log the action
    PERFORM public.log_user_action(
        'CREATE',
        'user',
        v_user_id,
        NULL,
        jsonb_build_object(
            'email', p_email,
            'full_name', p_full_name,
            'role_type', p_role_type,
            'status', 'pending'
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'activation_token', v_activation_token,
        'message', 'User created successfully with activation token'
    );
END;
$$;