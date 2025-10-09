-- Remove location parameter from user_create_pending function
DROP FUNCTION IF EXISTS public.user_create_pending(text, text, uuid, uuid, role_type, text, text, text);
DROP FUNCTION IF EXISTS public.user_create_pending(text, text, uuid, uuid, role_type, text, text);

-- Recreate user_create_pending without location parameter
CREATE OR REPLACE FUNCTION public.user_create_pending(
    p_email text,
    p_full_name text,
    p_tenant_id uuid,
    p_organization_id uuid DEFAULT NULL::uuid,
    p_role_type role_type DEFAULT 'responder'::role_type,
    p_phone text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;