-- =====================================================
-- COMPLETE USER ACTIVATION SYSTEM
-- Create all necessary functions for user lifecycle
-- =====================================================

-- Map existing roles to new system (now that enum values exist)
UPDATE public.user_roles 
SET role_type = 'team_leader' 
WHERE role_type IN ('organization_admin', 'supervisor');

UPDATE public.user_roles 
SET role_type = 'responder' 
WHERE role_type = 'member';

-- Create user management functions
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
    -- Generate activation token
    v_activation_token := encode(gen_random_bytes(32), 'base64url');
    
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

-- Function to activate user account
CREATE OR REPLACE FUNCTION public.activate_user_account(p_activation_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_token_expires NUMERIC;
    v_current_time NUMERIC;
BEGIN
    -- Get current time as epoch
    v_current_time := extract(epoch from now());
    
    -- Find user with matching token
    SELECT 
        id, 
        email,
        (profile_data->>'activation_token_expires')::numeric
    INTO v_user_id, v_user_email, v_token_expires
    FROM public.users 
    WHERE profile_data->>'activation_token' = p_activation_token
    AND status = 'pending';
    
    -- Check if user exists
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid or expired activation token'
        );
    END IF;
    
    -- Check if token is expired
    IF v_token_expires < v_current_time THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Activation token has expired'
        );
    END IF;
    
    -- Activate the user
    UPDATE public.users 
    SET 
        status = 'active',
        email_verified = true,
        profile_data = profile_data - 'activation_token' - 'activation_token_expires' || jsonb_build_object(
            'activated_at', extract(epoch from now())
        ),
        updated_at = now()
    WHERE id = v_user_id;
    
    -- Log the activation
    PERFORM public.log_user_action(
        'ACTIVATE',
        'user',
        v_user_id,
        jsonb_build_object('status', 'pending'),
        jsonb_build_object('status', 'active', 'activated_via', 'activation_token')
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'email', v_user_email,
        'message', 'User account activated successfully'
    );
END;
$$;