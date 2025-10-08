-- Revert enterprise_id back to tenant_id in public.users table

-- Drop RLS policies that depend on enterprise_id
DROP POLICY IF EXISTS "Enterprise users can manage users in their enterprise" ON public.users;
DROP POLICY IF EXISTS "Enterprise write can manage users in enterprise" ON public.users;
DROP POLICY IF EXISTS "Platform admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view users in their organization" ON public.users;
DROP POLICY IF EXISTS "Org write can manage users in org" ON public.users;
DROP POLICY IF EXISTS "Organization users can manage users in their organization" ON public.users;

DROP POLICY IF EXISTS "Platform admins can manage all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Tenant write can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Enterprise users can create notifications in their enterprise" ON public.notifications;

DROP POLICY IF EXISTS "Platform admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enterprise users can manage roles in their enterprise" ON public.user_roles;
DROP POLICY IF EXISTS "Organization users can manage roles in their organization" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Rename enterprise_id back to tenant_id
ALTER TABLE public.users RENAME COLUMN enterprise_id TO tenant_id;

-- Recreate RLS policies using tenant_id
CREATE POLICY "Enterprise users can manage users in their enterprise" 
ON public.users 
FOR ALL 
USING ((tenant_id = user_get_current_tenant_id()) AND user_has_full_permission('enterprise_user'::role_type))
WITH CHECK ((tenant_id = user_get_current_tenant_id()) AND user_has_full_permission('enterprise_user'::role_type));

CREATE POLICY "Enterprise write can manage users in enterprise" 
ON public.users 
FOR ALL 
USING ((tenant_id = user_get_current_tenant_id()) AND (platform_is_admin() OR user_has_tenant_write()))
WITH CHECK ((tenant_id = user_get_current_tenant_id()) AND (platform_is_admin() OR user_has_tenant_write()));

CREATE POLICY "Org write can manage users in org" 
ON public.users 
FOR ALL 
USING ((organization_id = user_get_current_org()) AND (platform_is_admin() OR user_has_org_write()))
WITH CHECK ((organization_id = user_get_current_org()) AND (platform_is_admin() OR user_has_org_write()));

CREATE POLICY "Organization users can manage users in their organization" 
ON public.users 
FOR ALL 
USING ((organization_id = user_get_current_org()) AND user_has_full_permission('organization_user'::role_type))
WITH CHECK ((organization_id = user_get_current_org()) AND user_has_full_permission('organization_user'::role_type));

CREATE POLICY "Platform admins can manage all users" 
ON public.users 
FOR ALL 
USING (platform_is_admin())
WITH CHECK (platform_is_admin());

CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can view own profile" 
ON public.users 
FOR SELECT 
USING (auth_user_id = auth.uid());

CREATE POLICY "Users can view users in their organization" 
ON public.users 
FOR SELECT 
USING (organization_id = user_get_current_org());

-- Recreate notification policies
CREATE POLICY "Enterprise users can create notifications in their enterprise" 
ON public.notifications 
FOR INSERT 
WITH CHECK (user_has_role('enterprise_user'::role_type) AND (tenant_id = user_get_current_tenant_id()) AND (user_id IN (SELECT users.id FROM users WHERE (users.tenant_id = user_get_current_tenant_id()))));

CREATE POLICY "Platform admins can manage all notifications" 
ON public.notifications 
FOR ALL 
USING (platform_is_admin())
WITH CHECK (platform_is_admin());

CREATE POLICY "Tenant write can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK ((user_has_tenant_write() OR platform_is_admin()) AND (tenant_id = user_get_current_tenant_id()));

CREATE POLICY "Users can update own notifications" 
ON public.notifications 
FOR UPDATE 
USING (user_id IN (SELECT users.id FROM users WHERE (users.auth_user_id = auth.uid())))
WITH CHECK (user_id IN (SELECT users.id FROM users WHERE (users.auth_user_id = auth.uid())));

CREATE POLICY "Users can view own notifications" 
ON public.notifications 
FOR SELECT 
USING (user_id IN (SELECT users.id FROM users WHERE (users.auth_user_id = auth.uid())));

-- Recreate user_roles policies
CREATE POLICY "Enterprise users can manage roles in their enterprise" 
ON public.user_roles 
FOR ALL 
USING (user_has_full_permission('enterprise_user'::role_type) AND (user_id IN (SELECT users.id FROM users WHERE (users.tenant_id = user_get_current_tenant_id()))))
WITH CHECK (user_has_full_permission('enterprise_user'::role_type) AND (user_id IN (SELECT users.id FROM users WHERE (users.tenant_id = user_get_current_tenant_id()))));

CREATE POLICY "Organization users can manage roles in their organization" 
ON public.user_roles 
FOR ALL 
USING (user_has_full_permission('organization_user'::role_type) AND (user_id IN (SELECT users.id FROM users WHERE (users.organization_id = user_get_current_org()))))
WITH CHECK (user_has_full_permission('organization_user'::role_type) AND (user_id IN (SELECT users.id FROM users WHERE (users.organization_id = user_get_current_org()))));

CREATE POLICY "Platform admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (platform_is_admin())
WITH CHECK (platform_is_admin());

CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id IN (SELECT users.id FROM users WHERE (users.auth_user_id = auth.uid())));

-- Update the user_create_with_activation function to use tenant_id again
CREATE OR REPLACE FUNCTION public.user_create_with_activation(
  p_email text,
  p_full_name text,
  p_tenant_id uuid,
  p_organization_id uuid DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_role_type role_type DEFAULT 'responder'::role_type,
  p_permission text DEFAULT 'full'::text,
  p_request_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_activation_token text;
  v_temp_password text;
  v_first_name text;
  v_last_name text;
  v_existing_request uuid;
  v_org_tenant_id uuid;
BEGIN
  -- Check for duplicate request
  IF p_request_id IS NOT NULL THEN
    SELECT resource_id INTO v_existing_request
    FROM public.idempotency_results
    WHERE request_id = p_request_id AND resource_type = 'user';
    
    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', true,
        'user_id', v_existing_request,
        'message', 'User already created'
      );
    END IF;
    
    INSERT INTO public.idempotency_keys (id) VALUES (p_request_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Validate organization/tenant relationship
  IF p_organization_id IS NOT NULL THEN
    SELECT tenant_id INTO v_org_tenant_id
    FROM public.organizations
    WHERE id = p_organization_id;
    
    -- For standalone organizations, tenant_id must equal organization_id
    IF v_org_tenant_id IS NULL THEN
      IF p_tenant_id != p_organization_id THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'For standalone organizations, tenant_id must equal organization_id'
        );
      END IF;
    ELSE
      -- For organizations under an enterprise, validate tenant matches
      IF v_org_tenant_id != p_tenant_id THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'Organization does not belong to the specified tenant'
        );
      END IF;
    END IF;
  END IF;

  -- Generate temporary password
  v_temp_password := '';
  v_temp_password := v_temp_password || chr(65 + floor(random() * 26)::int);
  v_temp_password := v_temp_password || chr(97 + floor(random() * 26)::int);
  v_temp_password := v_temp_password || chr(48 + floor(random() * 10)::int);
  v_temp_password := v_temp_password || substr('!@#$%^&*', floor(random() * 8)::int + 1, 1);
  FOR i IN 1..8 LOOP
    v_temp_password := v_temp_password || substr('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*', floor(random() * 70)::int + 1, 1);
  END LOOP;

  -- Parse name
  v_first_name := split_part(p_full_name, ' ', 1);
  v_last_name := CASE 
    WHEN position(' ' in p_full_name) > 0 
    THEN substring(p_full_name from position(' ' in p_full_name) + 1)
    ELSE ''
  END;

  -- Generate activation token
  v_activation_token := replace(replace(replace(gen_random_uuid()::text, '-', ''), '{', ''), '}', '') || 
                       replace(replace(replace(gen_random_uuid()::text, '-', ''), '{', ''), '}', '');

  -- Create user with tenant_id
  INSERT INTO public.users (
    email,
    full_name,
    first_name,
    last_name,
    tenant_id,
    organization_id,
    phone,
    status,
    profile_data
  ) VALUES (
    p_email,
    p_full_name,
    v_first_name,
    v_last_name,
    p_tenant_id,
    p_organization_id,
    p_phone,
    'pending'::user_status,
    jsonb_build_object(
      'temp_password', v_temp_password,
      'activation_token', v_activation_token,
      'activation_expires', (now() + interval '24 hours')::text
    )
  ) RETURNING id INTO v_user_id;

  -- Assign role
  INSERT INTO public.user_roles (
    user_id,
    role_type,
    permission,
    granted_by,
    organization_id
  ) VALUES (
    v_user_id,
    p_role_type,
    p_permission,
    NULL,
    p_organization_id
  );

  -- Store idempotency result
  IF p_request_id IS NOT NULL THEN
    INSERT INTO public.idempotency_results (request_id, resource_type, resource_id)
    VALUES (p_request_id, 'user', v_user_id);
  END IF;

  -- Audit log
  INSERT INTO public.audit_logs (
    tenant_id,
    user_id,
    action,
    resource_type,
    resource_id,
    new_values,
    metadata
  ) VALUES (
    p_tenant_id,
    NULL,
    'CREATE',
    'user',
    v_user_id,
    jsonb_build_object(
      'email', p_email,
      'full_name', p_full_name,
      'role_type', p_role_type,
      'permission', p_permission
    ),
    jsonb_build_object('method', 'admin_invitation')
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'activation_token', v_activation_token,
    'temp_password', v_temp_password
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;