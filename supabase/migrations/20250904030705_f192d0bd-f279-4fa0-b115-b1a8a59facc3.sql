-- =====================================================
-- CREATE FIRST PLATFORM ADMIN (SAFE VERSION)
-- Handles existing users and creates platform admin safely
-- =====================================================

DO $$ 
DECLARE 
    v_auth_user_id UUID;
    v_user_id UUID;
    v_tenant_id UUID;
    v_temp_password TEXT := 'MissionLog2025!'; -- Temporary password
    v_user_exists BOOLEAN := false;
BEGIN
    -- Get or create the main tenant
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'missionlog-platform';
    
    IF v_tenant_id IS NULL THEN
        INSERT INTO public.tenants (name, slug, subscription_tier, max_organizations, max_users) 
        VALUES ('MissionLog Platform', 'missionlog-platform', 'enterprise', 100, 1000)
        RETURNING id INTO v_tenant_id;
        
        RAISE NOTICE 'Created new tenant: MissionLog Platform';
    END IF;

    -- Check if user already exists
    SELECT u.auth_user_id, u.id INTO v_auth_user_id, v_user_id 
    FROM public.users u 
    WHERE u.email = 'baha7uddin@gmail.com';
    
    IF v_user_id IS NOT NULL THEN
        v_user_exists := true;
        RAISE NOTICE 'User already exists with ID: %', v_user_id;
        
        -- Update existing user to be platform admin if not already
        UPDATE public.users 
        SET 
            tenant_id = v_tenant_id,
            full_name = 'Platform Administrator',
            first_name = 'Platform',
            last_name = 'Administrator',
            status = 'active',
            email_verified = true,
            updated_at = now()
        WHERE id = v_user_id;
        
    ELSE
        -- Create new auth user
        v_auth_user_id := gen_random_uuid();
        
        INSERT INTO auth.users (
            id,
            email,
            email_confirmed_at,
            encrypted_password,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            v_auth_user_id,
            'baha7uddin@gmail.com',
            now(),
            crypt(v_temp_password, gen_salt('bf')),
            jsonb_build_object(
                'full_name', 'Platform Administrator',
                'tenant_id', v_tenant_id::text
            ),
            now(),
            now()
        );

        -- Create public user record
        INSERT INTO public.users (
            auth_user_id,
            tenant_id,
            organization_id,
            email,
            full_name,
            first_name,
            last_name,
            status,
            email_verified
        ) VALUES (
            v_auth_user_id,
            v_tenant_id,
            NULL,
            'baha7uddin@gmail.com',
            'Platform Administrator',
            'Platform',
            'Administrator',
            'active',
            true
        ) RETURNING id INTO v_user_id;
        
        RAISE NOTICE 'Created new user with ID: %', v_user_id;
    END IF;

    -- Ensure platform admin role exists (upsert)
    INSERT INTO public.user_roles (
        user_id,
        role_type,
        organization_id,
        is_active,
        granted_at
    ) VALUES (
        v_user_id,
        'platform_admin',
        NULL,
        true,
        now()
    )
    ON CONFLICT (user_id, role_type) DO UPDATE SET
        is_active = true,
        granted_at = now();

    -- Log the action
    INSERT INTO public.audit_logs (
        tenant_id,
        user_id,
        action,
        resource_type,
        resource_id,
        new_values
    ) VALUES (
        v_tenant_id,
        v_user_id,
        CASE WHEN v_user_exists THEN 'UPDATE' ELSE 'CREATE' END,
        'user',
        v_user_id,
        jsonb_build_object(
            'email', 'baha7uddin@gmail.com',
            'role_type', 'platform_admin',
            'created_by', 'system_seeding',
            'temp_password', v_temp_password
        )
    );

    RAISE NOTICE 'Platform admin setup completed!';
    RAISE NOTICE 'Email: baha7uddin@gmail.com';
    RAISE NOTICE 'Temporary Password: %', v_temp_password;
    RAISE NOTICE 'User must change password on first login';
    
END $$;