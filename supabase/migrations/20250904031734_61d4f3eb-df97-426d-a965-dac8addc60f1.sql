-- =====================================================
-- SEND ACTIVATION EMAIL TO PLATFORM ADMIN
-- Test the activation system by sending email to first platform admin
-- =====================================================

DO $$ 
DECLARE 
    v_user_record RECORD;
BEGIN
    -- Get the platform admin user
    SELECT u.id, u.email, u.full_name 
    INTO v_user_record
    FROM public.users u 
    JOIN public.user_roles ur ON u.id = ur.user_id 
    WHERE ur.role_type = 'platform_admin' 
    AND u.email = 'baha7uddin@gmail.com'
    LIMIT 1;
    
    IF v_user_record.id IS NOT NULL THEN
        -- Generate activation token for the platform admin
        PERFORM public.generate_activation_token(v_user_record.id);
        
        RAISE NOTICE 'Activation token generated for user: % (ID: %)', v_user_record.email, v_user_record.id;
        RAISE NOTICE 'You can now call the send-activation-email edge function with:';
        RAISE NOTICE 'userId: %', v_user_record.id;
        RAISE NOTICE 'email: %', v_user_record.email; 
        RAISE NOTICE 'fullName: %', v_user_record.full_name;
    ELSE
        RAISE NOTICE 'No platform admin found for baha7uddin@gmail.com';
    END IF;
END $$;