-- =====================================================
-- PATROLLER CONSOLE ESSENTIAL FUNCTIONS & PROCEDURES - PHASE 3
-- Core Business Logic and User Management
-- =====================================================

-- =====================================================
-- 1. USER MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to create a new user (used by registration/admin)
CREATE OR REPLACE FUNCTION public.create_user(
  p_email TEXT,
  p_full_name TEXT,
  p_tenant_id UUID,
  p_organization_id UUID DEFAULT NULL,
  p_role_type role_type DEFAULT 'member',
  p_phone TEXT DEFAULT NULL,
  p_employee_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_auth_user_id UUID;
BEGIN
  -- Create auth user first
  INSERT INTO auth.users (
    email,
    email_confirmed_at,
    raw_user_meta_data
  ) VALUES (
    p_email,
    now(),
    jsonb_build_object(
      'full_name', p_full_name,
      'tenant_id', p_tenant_id::text,
      'organization_id', p_organization_id::text
    )
  ) RETURNING id INTO v_auth_user_id;

  -- Create public user record
  INSERT INTO public.users (
    auth_user_id,
    tenant_id,
    organization_id,
    email,
    full_name,
    phone,
    employee_id,
    status,
    email_verified
  ) VALUES (
    v_auth_user_id,
    p_tenant_id,
    p_organization_id,
    p_email,
    p_full_name,
    p_phone,
    p_employee_id,
    'active',
    true
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
  INSERT INTO public.audit_logs (
    tenant_id,
    user_id,
    action,
    resource_type,
    resource_id,
    new_values
  ) VALUES (
    p_tenant_id,
    v_user_id,
    'CREATE',
    'user',
    v_user_id,
    jsonb_build_object(
      'email', p_email,
      'full_name', p_full_name,
      'role_type', p_role_type
    )
  );

  RETURN v_user_id;
END;
$$;

-- Function to handle new user signup from auth trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_organization_id UUID;
  v_full_name TEXT;
  v_user_id UUID;
BEGIN
  -- Extract metadata from auth user
  v_tenant_id := (NEW.raw_user_meta_data->>'tenant_id')::UUID;
  v_organization_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);

  -- Only process if we have tenant information
  IF v_tenant_id IS NOT NULL THEN
    -- Create public user record
    INSERT INTO public.users (
      auth_user_id,
      tenant_id,
      organization_id,
      email,
      full_name,
      status,
      email_verified
    ) VALUES (
      NEW.id,
      v_tenant_id,
      v_organization_id,
      NEW.email,
      v_full_name,
      'pending',
      COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
    ) RETURNING id INTO v_user_id;

    -- Assign default member role
    INSERT INTO public.user_roles (
      user_id,
      role_type,
      organization_id,
      is_active
    ) VALUES (
      v_user_id,
      'member',
      v_organization_id,
      true
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for handling new signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- =====================================================
-- 2. TENANT & ORGANIZATION MANAGEMENT
-- =====================================================

-- Function to create a new tenant with default organization
CREATE OR REPLACE FUNCTION public.create_tenant_with_organization(
  p_tenant_name TEXT,
  p_tenant_slug TEXT,
  p_org_name TEXT,
  p_org_slug TEXT,
  p_org_type organization_type,
  p_admin_email TEXT,
  p_admin_name TEXT,
  p_subscription_tier subscription_tier DEFAULT 'free'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_org_id UUID;
  v_admin_user_id UUID;
  result JSONB;
BEGIN
  -- Create tenant
  INSERT INTO public.tenants (
    name,
    slug,
    subscription_tier,
    max_organizations,
    max_users
  ) VALUES (
    p_tenant_name,
    p_tenant_slug,
    p_subscription_tier,
    CASE WHEN p_subscription_tier = 'enterprise' THEN 100 ELSE 1 END,
    CASE 
      WHEN p_subscription_tier = 'enterprise' THEN 1000
      WHEN p_subscription_tier = 'professional' THEN 100
      ELSE 10
    END
  ) RETURNING id INTO v_tenant_id;

  -- Create default organization
  INSERT INTO public.organizations (
    tenant_id,
    name,
    slug,
    organization_type,
    contact_email
  ) VALUES (
    v_tenant_id,
    p_org_name,
    p_org_slug,
    p_org_type,
    p_admin_email
  ) RETURNING id INTO v_org_id;

  -- Create admin user
  SELECT public.create_user(
    p_admin_email,
    p_admin_name,
    v_tenant_id,
    v_org_id,
    CASE WHEN p_subscription_tier = 'enterprise' THEN 'enterprise_admin' ELSE 'organization_admin' END
  ) INTO v_admin_user_id;

  -- Return created IDs
  result := jsonb_build_object(
    'tenant_id', v_tenant_id,
    'organization_id', v_org_id,
    'admin_user_id', v_admin_user_id
  );

  RETURN result;
END;
$$;

-- =====================================================
-- 3. AUDIT LOGGING FUNCTIONS
-- =====================================================

-- Function to log user actions automatically
CREATE OR REPLACE FUNCTION public.log_user_action(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_tenant_id UUID;
BEGIN
  -- Get current user info
  SELECT id, tenant_id INTO v_user_id, v_tenant_id
  FROM public.users WHERE auth_user_id = auth.uid();

  -- Only log if user is authenticated and we have tenant info
  IF v_user_id IS NOT NULL AND v_tenant_id IS NOT NULL THEN
    INSERT INTO public.audit_logs (
      tenant_id,
      user_id,
      action,
      resource_type,
      resource_id,
      old_values,
      new_values,
      metadata
    ) VALUES (
      v_tenant_id,
      v_user_id,
      p_action,
      p_resource_type,
      p_resource_id,
      p_old_values,
      p_new_values,
      p_metadata
    );
  END IF;
END;
$$;

-- =====================================================
-- 4. EQUIPMENT MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to assign equipment to user
CREATE OR REPLACE FUNCTION public.assign_equipment(
  p_equipment_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_assigned_to UUID;
  v_equipment_name TEXT;
BEGIN
  -- Get current assignment
  SELECT assigned_to, name INTO v_old_assigned_to, v_equipment_name
  FROM public.equipment WHERE id = p_equipment_id;

  -- Update assignment
  UPDATE public.equipment 
  SET assigned_to = p_user_id, 
      status = 'in_use',
      updated_at = now()
  WHERE id = p_equipment_id;

  -- Log the action
  PERFORM public.log_user_action(
    'ASSIGN_EQUIPMENT',
    'equipment',
    p_equipment_id,
    jsonb_build_object('assigned_to', v_old_assigned_to),
    jsonb_build_object('assigned_to', p_user_id),
    jsonb_build_object('equipment_name', v_equipment_name)
  );

  RETURN true;
END;
$$;

-- =====================================================
-- 5. INCIDENT MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to create incident with automatic logging
CREATE OR REPLACE FUNCTION public.create_incident(
  p_title TEXT,
  p_description TEXT,
  p_incident_type TEXT,
  p_priority incident_priority,
  p_location_id UUID DEFAULT NULL,
  p_occurred_at TIMESTAMP WITH TIME ZONE DEFAULT now()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_incident_id UUID;
  v_user_id UUID;
  v_organization_id UUID;
BEGIN
  -- Get current user organization
  SELECT id, organization_id INTO v_user_id, v_organization_id
  FROM public.users WHERE auth_user_id = auth.uid();

  -- Create incident
  INSERT INTO public.incidents (
    organization_id,
    location_id,
    reported_by,
    title,
    description,
    incident_type,
    priority,
    occurred_at
  ) VALUES (
    v_organization_id,
    p_location_id,
    v_user_id,
    p_title,
    p_description,
    p_incident_type,
    p_priority,
    p_occurred_at
  ) RETURNING id INTO v_incident_id;

  -- Log the action
  PERFORM public.log_user_action(
    'CREATE',
    'incident',
    v_incident_id,
    NULL,
    jsonb_build_object(
      'title', p_title,
      'incident_type', p_incident_type,
      'priority', p_priority
    )
  );

  RETURN v_incident_id;
END;
$$;

-- =====================================================
-- 6. NOTIFICATION FUNCTIONS
-- =====================================================

-- Function to send notification to users
CREATE OR REPLACE FUNCTION public.send_notification(
  p_user_ids UUID[],
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_tenant_id UUID;
  v_count INTEGER := 0;
BEGIN
  -- Get current user's tenant
  SELECT tenant_id INTO v_tenant_id
  FROM public.users WHERE auth_user_id = auth.uid();

  -- Send notification to each user
  FOREACH v_user_id IN ARRAY p_user_ids
  LOOP
    -- Verify user is in same tenant
    IF EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = v_user_id AND tenant_id = v_tenant_id
    ) THEN
      INSERT INTO public.notifications (
        tenant_id,
        user_id,
        title,
        message,
        type,
        expires_at
      ) VALUES (
        v_tenant_id,
        v_user_id,
        p_title,
        p_message,
        p_type,
        p_expires_at
      );
      
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$;

-- =====================================================
-- 7. UTILITY & SEARCH FUNCTIONS
-- =====================================================

-- Function to search across multiple entities
CREATE OR REPLACE FUNCTION public.global_search(
  p_query TEXT,
  p_limit INTEGER DEFAULT 50
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_organization_id UUID;
  result JSONB := '{"users": [], "equipment": [], "incidents": []}';
BEGIN
  -- Get current user context
  SELECT tenant_id, organization_id INTO v_tenant_id, v_organization_id
  FROM public.users WHERE auth_user_id = auth.uid();

  -- Search users
  WITH user_results AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', id,
        'type', 'user',
        'title', full_name,
        'subtitle', email,
        'url', '/users/' || id
      )
    ) as users
    FROM public.users
    WHERE tenant_id = v_tenant_id
    AND (full_name ILIKE '%' || p_query || '%' OR email ILIKE '%' || p_query || '%')
    LIMIT p_limit
  )
  SELECT COALESCE(users, '[]'::jsonb) INTO result FROM user_results;

  -- Add equipment results
  WITH equipment_results AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', id,
        'type', 'equipment',
        'title', name,
        'subtitle', category || ' - ' || COALESCE(model, 'No model'),
        'status', status,
        'url', '/equipment/' || id
      )
    ) as equipment
    FROM public.equipment
    WHERE organization_id = v_organization_id
    AND (name ILIKE '%' || p_query || '%' OR category ILIKE '%' || p_query || '%' OR model ILIKE '%' || p_query || '%')
    LIMIT p_limit
  )
  SELECT result || jsonb_build_object('equipment', COALESCE(equipment, '[]'::jsonb))
  INTO result FROM equipment_results;

  -- Add incident results
  WITH incident_results AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', id,
        'type', 'incident',
        'title', title,
        'subtitle', incident_type || ' - ' || priority,
        'status', status,
        'url', '/incidents/' || id
      )
    ) as incidents
    FROM public.incidents
    WHERE organization_id = v_organization_id
    AND (title ILIKE '%' || p_query || '%' OR description ILIKE '%' || p_query || '%')
    LIMIT p_limit
  )
  SELECT result || jsonb_build_object('incidents', COALESCE(incidents, '[]'::jsonb))
  INTO result FROM incident_results;

  RETURN result;
END;
$$;

-- =====================================================
-- 8. AUTOMATIC PARTITION MANAGEMENT
-- =====================================================

-- Function to create monthly audit log partitions
CREATE OR REPLACE FUNCTION public.create_audit_log_partition(
  p_year INTEGER,
  p_month INTEGER
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_table_name TEXT;
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  v_table_name := 'audit_logs_' || p_year || '_' || LPAD(p_month::TEXT, 2, '0');
  v_start_date := DATE(p_year || '-' || p_month || '-01');
  v_end_date := v_start_date + INTERVAL '1 month';

  -- Create partition if it doesn't exist
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.audit_logs 
     FOR VALUES FROM (%L) TO (%L)',
    v_table_name, v_start_date, v_end_date
  );

  RETURN v_table_name;
END;
$$;

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_tenant_with_organization TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_user_action TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_equipment TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_incident TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.global_search TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_audit_log_partition TO authenticated;