-- =====================================================
-- CREATE FIRST PLATFORM ADMIN USING EXISTING FUNCTIONS
-- Simple approach using the create_user function
-- =====================================================

DO $$ 
DECLARE 
    v_user_id UUID;
    v_tenant_id UUID;
    v_temp_password TEXT := 'MissionLog2025!';
BEGIN
    -- Get or create the main tenant
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'missionlog-platform';
    
    IF v_tenant_id IS NULL THEN
        INSERT INTO public.tenants (name, slug, subscription_tier, max_organizations, max_users) 
        VALUES ('MissionLog Platform', 'missionlog-platform', 'enterprise', 100, 1000)
        RETURNING id INTO v_tenant_id;
    END IF;

    -- Check if platform admin already exists
    IF NOT EXISTS (
        SELECT 1 FROM public.users u 
        JOIN public.user_roles ur ON u.id = ur.user_id 
        WHERE ur.role_type = 'platform_admin' AND u.email = 'baha7uddin@gmail.com'
    ) THEN
        -- Use the existing create_user function but we need to modify it for platform admin
        -- First, let's just insert directly into public tables only
        
        INSERT INTO public.users (
            auth_user_id,  -- We'll set this to NULL for now since we're not using Supabase auth yet
            tenant_id,
            organization_id,
            email,
            full_name,
            first_name,
            last_name,
            status,
            email_verified
        ) VALUES (
            NULL, -- Will be set when they first log in through the auth system
            v_tenant_id,
            NULL, -- Platform admin doesn't belong to specific organization
            'baha7uddin@gmail.com',
            'Platform Administrator',
            'Platform',
            'Administrator',
            'pending', -- Will be activated when they first log in
            false
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
                'created_by', 'system_seeding',
                'initial_password', v_temp_password,
                'setup_method', 'activation_email'
            )
        );

        RAISE NOTICE 'Platform admin created successfully!';
        RAISE NOTICE 'Email: baha7uddin@gmail.com';
        RAISE NOTICE 'User ID: %', v_user_id;
        RAISE NOTICE 'Status: pending (will be activated via activation email)';
        RAISE NOTICE 'Initial password: %', v_temp_password;
    ELSE
        RAISE NOTICE 'Platform admin already exists for baha7uddin@gmail.com';
    END IF;
    
END $$;