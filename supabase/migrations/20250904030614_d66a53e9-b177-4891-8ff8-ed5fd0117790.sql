-- =====================================================
-- CREATE FIRST PLATFORM ADMIN AND UPDATE ROLES
-- Step 1: Create the first platform admin user
-- =====================================================

-- Generate a random UUID for the auth user
DO $$ 
DECLARE 
    v_auth_user_id UUID := gen_random_uuid();
    v_user_id UUID;
    v_tenant_id UUID;
    v_temp_password TEXT := 'TempPass2025!'; -- Temporary password for first login
BEGIN
    -- Get the demo tenant ID
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'demo-emergency';
    
    -- If no tenant exists, create one
    IF v_tenant_id IS NULL THEN
        INSERT INTO public.tenants (name, slug, subscription_tier, max_organizations, max_users) 
        VALUES ('MissionLog Platform', 'missionlog-platform', 'enterprise', 100, 1000)
        RETURNING id INTO v_tenant_id;
    END IF;

    -- Insert into auth.users table (this creates the authentication record)
    INSERT INTO auth.users (
        id,
        email,
        email_confirmed_at,
        encrypted_password,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        phone_change
    ) VALUES (
        v_auth_user_id,
        'baha7uddin@gmail.com',
        now(),
        crypt(v_temp_password, gen_salt('bf')), -- Encrypted password
        jsonb_build_object(
            'full_name', 'Platform Administrator',
            'tenant_id', v_tenant_id::text
        ),
        now(),
        now(),
        '',
        '',
        ''
    );

    -- Create the public user record
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
        NULL, -- Platform admin doesn't belong to specific organization
        'baha7uddin@gmail.com',
        'Platform Administrator',
        'Platform',
        'Administrator', 
        'active',
        true
    ) RETURNING id INTO v_user_id;

    -- Assign platform admin role
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
    );

    -- Log the creation
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
        'CREATE',
        'user',
        v_user_id,
        jsonb_build_object(
            'email', 'baha7uddin@gmail.com',
            'role_type', 'platform_admin',
            'created_by', 'system_seeding'
        )
    );

    RAISE NOTICE 'Platform admin created successfully with email: baha7uddin@gmail.com';
    RAISE NOTICE 'Temporary password: %', v_temp_password;
    RAISE NOTICE 'User ID: %', v_user_id;
    RAISE NOTICE 'Auth User ID: %', v_auth_user_id;
END $$;