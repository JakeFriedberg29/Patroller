-- Create auth user for existing platform admin
DO $$
DECLARE
    existing_user_id UUID;
    new_auth_user_id UUID;
BEGIN
    -- Get the existing user record
    SELECT id INTO existing_user_id 
    FROM public.users 
    WHERE email = 'baha7uddin@gmail.com';
    
    -- Create auth user (this will trigger our handle_new_user_signup function)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        confirmation_sent_at,
        raw_user_meta_data,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'baha7uddin@gmail.com',
        crypt('MissionLog2025!', gen_salt('bf')),
        now(),
        now(),
        jsonb_build_object(
            'full_name', 'Platform Administrator',
            'tenant_id', '95d3bca1-40f0-4630-a60e-1d98dacf3e60',
            'organization_id', null
        ),
        now(),
        now()
    ) RETURNING id INTO new_auth_user_id;
    
    -- Update existing user record with auth_user_id
    UPDATE public.users 
    SET auth_user_id = new_auth_user_id,
        email_verified = true,
        status = 'active'
    WHERE id = existing_user_id;
    
    RAISE NOTICE 'Platform admin auth user created successfully. User can now login with: baha7uddin@gmail.com / MissionLog2025!';
END $$;