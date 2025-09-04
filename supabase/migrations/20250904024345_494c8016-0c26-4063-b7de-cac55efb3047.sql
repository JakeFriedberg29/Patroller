-- =====================================================
-- MISSIONLOG SAMPLE DATA - CORRECTED VERSION
-- Basic Development and Testing Data Setup  
-- =====================================================

-- =====================================================
-- 1. CREATE BASIC SAMPLE TENANTS AND ORGANIZATIONS
-- =====================================================

-- Insert sample tenants directly
INSERT INTO public.tenants (name, slug, subscription_tier, max_organizations, max_users) VALUES
('Mountain Rescue Alliance', 'mountain-rescue', 'professional', 5, 100),
('Coastal Safety Services', 'coastal-safety', 'professional', 5, 100),
('Community Emergency Response', 'community-emergency', 'free', 1, 10);

-- Insert sample organizations
DO $$
DECLARE
  mountain_rescue_tenant_id UUID;
  coastal_safety_tenant_id UUID;
  community_emergency_tenant_id UUID;
BEGIN
  -- Get tenant IDs
  SELECT id INTO mountain_rescue_tenant_id FROM public.tenants WHERE slug = 'mountain-rescue';
  SELECT id INTO coastal_safety_tenant_id FROM public.tenants WHERE slug = 'coastal-safety';
  SELECT id INTO community_emergency_tenant_id FROM public.tenants WHERE slug = 'community-emergency';

  -- Insert organizations
  INSERT INTO public.organizations (tenant_id, name, slug, organization_type, description, contact_email) VALUES
  (mountain_rescue_tenant_id, 'Rocky Mountain Search & Rescue', 'rocky-mountain-sar', 'search_and_rescue', 'Mountain search and rescue operations', 'contact@rockymountainsar.org'),
  (coastal_safety_tenant_id, 'Pacific Beach Lifeguard Station', 'pacific-beach-lg', 'lifeguard_service', 'Beach and water safety services', 'contact@pacificbeachlifeguards.org'),
  (community_emergency_tenant_id, 'Volunteer Fire Department', 'volunteer-fd', 'volunteer_emergency_services', 'Community volunteer emergency services', 'contact@volunteerfd.org');
END $$;

-- =====================================================
-- 2. CREATE SAMPLE USERS AND ROLES
-- =====================================================

DO $$
DECLARE
  org_record RECORD;
  user_id UUID;
BEGIN
  -- Create sample users for each organization
  FOR org_record IN 
    SELECT o.id as org_id, o.tenant_id, o.name as org_name, o.organization_type
    FROM public.organizations o
  LOOP
    -- Create organization admin
    INSERT INTO public.users (
      tenant_id, organization_id, email, full_name, status, email_verified
    ) VALUES (
      org_record.tenant_id,
      org_record.org_id,
      'admin@' || LOWER(REPLACE(org_record.org_name, ' ', '')) || '.org',
      'Admin ' || org_record.org_name,
      'active',
      true
    ) RETURNING id INTO user_id;
    
    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role_type, organization_id, is_active) VALUES
    (user_id, 'organization_admin', org_record.org_id, true);
    
    -- Create sample members
    FOR i IN 1..3 LOOP
      INSERT INTO public.users (
        tenant_id, organization_id, email, full_name, status, email_verified
      ) VALUES (
        org_record.tenant_id,
        org_record.org_id,
        'member' || i || '@' || LOWER(REPLACE(org_record.org_name, ' ', '')) || '.org',
        'Team Member ' || i,
        'active',
        true
      ) RETURNING id INTO user_id;
      
      -- Assign member role
      INSERT INTO public.user_roles (user_id, role_type, organization_id, is_active) VALUES
      (user_id, 'member', org_record.org_id, true);
    END LOOP;
  END LOOP;
END $$;

-- =====================================================
-- 3. CREATE SAMPLE DEPARTMENTS AND LOCATIONS
-- =====================================================

DO $$
DECLARE
  org_record RECORD;
BEGIN
  FOR org_record IN SELECT id FROM public.organizations LOOP
    -- Create departments
    INSERT INTO public.departments (organization_id, name, description) VALUES
    (org_record.id, 'Operations', 'Primary operational response team'),
    (org_record.id, 'Training', 'Training and certification department'),
    (org_record.id, 'Equipment', 'Equipment management and maintenance');
    
    -- Create locations
    INSERT INTO public.locations (organization_id, name, description, address) VALUES
    (org_record.id, 'Headquarters', 'Main operational base', 
     jsonb_build_object('street', '123 Emergency Way', 'city', 'Safety City', 'state', 'CA', 'zip', '90210')),
    (org_record.id, 'Field Station Alpha', 'Primary field station',
     jsonb_build_object('street', '456 Response Rd', 'city', 'Safety City', 'state', 'CA', 'zip', '90211'));
  END LOOP;
END $$;

-- =====================================================
-- 4. CREATE SAMPLE EQUIPMENT
-- =====================================================

DO $$
DECLARE
  org_record RECORD;
  equipment_categories TEXT[];
  category TEXT;
BEGIN
  FOR org_record IN 
    SELECT id, organization_type FROM public.organizations 
  LOOP
    equipment_categories := CASE org_record.organization_type
      WHEN 'search_and_rescue' THEN ARRAY['Radios', 'Rescue Ropes', 'First Aid Kits', 'Stretchers']
      WHEN 'lifeguard_service' THEN ARRAY['Rescue Tubes', 'Life Vests', 'Rescue Boards', 'First Aid Kits']
      WHEN 'volunteer_emergency_services' THEN ARRAY['Radios', 'First Aid Kits', 'Flashlights', 'Fire Extinguishers']
      ELSE ARRAY['Radios', 'First Aid Kits', 'Emergency Supplies']
    END;
    
    FOREACH category IN ARRAY equipment_categories
    LOOP
      FOR i IN 1..3 LOOP
        INSERT INTO public.equipment (
          organization_id, name, category, model, serial_number, status
        ) VALUES (
          org_record.id,
          category || ' Unit ' || i,
          category,
          'Model-' || i,
          'SN-' || UPPER(LEFT(category, 3)) || '-' || LPAD(i::TEXT, 3, '0'),
          'available'
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- =====================================================
-- 5. CREATE SAMPLE INCIDENTS
-- =====================================================

DO $$
DECLARE
  org_record RECORD;
  user_record RECORD;
  location_record RECORD;
BEGIN
  FOR org_record IN 
    SELECT o.id, o.organization_type FROM public.organizations o
  LOOP
    -- Get a user and location for this organization
    SELECT INTO user_record u.id 
    FROM public.users u 
    WHERE u.organization_id = org_record.id LIMIT 1;
    
    SELECT INTO location_record l.id 
    FROM public.locations l 
    WHERE l.organization_id = org_record.id LIMIT 1;
    
    IF user_record.id IS NOT NULL AND location_record.id IS NOT NULL THEN
      -- Create sample incidents
      INSERT INTO public.incidents (
        organization_id, location_id, reported_by, title, description, 
        incident_type, priority, status, occurred_at
      ) VALUES 
      (org_record.id, location_record.id, user_record.id, 
       'Sample Emergency Response', 'Test incident for system demonstration', 
       'Emergency Response', 'medium', 'resolved', now() - INTERVAL '1 day'),
      (org_record.id, location_record.id, user_record.id, 
       'Training Exercise', 'Regular training drill exercise', 
       'Training', 'low', 'resolved', now() - INTERVAL '3 days');
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- 6. CREATE SAMPLE REPORT TEMPLATES
-- =====================================================

DO $$
DECLARE
  org_record RECORD;
  admin_user RECORD;
BEGIN
  FOR org_record IN SELECT id FROM public.organizations LOOP
    -- Get admin user for this organization
    SELECT INTO admin_user u.id 
    FROM public.users u 
    JOIN public.user_roles ur ON u.id = ur.user_id 
    WHERE u.organization_id = org_record.id 
    AND ur.role_type = 'organization_admin'
    LIMIT 1;
    
    IF admin_user.id IS NOT NULL THEN
      INSERT INTO public.report_templates (
        organization_id, name, description, template_schema, created_by, is_active
      ) VALUES (
        org_record.id,
        'Incident Report',
        'Standard incident reporting template',
        '{"fields": [
          {"name": "incident_number", "type": "text", "required": true},
          {"name": "date_time", "type": "datetime", "required": true},
          {"name": "location", "type": "text", "required": true},
          {"name": "description", "type": "textarea", "required": true},
          {"name": "priority", "type": "select", "options": ["Low", "Medium", "High", "Critical"], "required": true}
        ]}'::jsonb,
        admin_user.id,
        true
      );
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- 7. CREATE SAMPLE NOTIFICATIONS
-- =====================================================

DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Create welcome notifications for all users
  FOR user_record IN 
    SELECT u.id, u.tenant_id, u.full_name FROM public.users u LIMIT 5
  LOOP
    INSERT INTO public.notifications (
      tenant_id, user_id, title, message, type, read
    ) VALUES (
      user_record.tenant_id,
      user_record.id,
      'Welcome to MissionLog!',
      'Welcome ' || user_record.full_name || '! Your account has been set up successfully.',
      'success',
      false
    );
  END LOOP;
END $$;

-- =====================================================
-- 8. CREATE AUDIT LOG PARTITIONS FOR CURRENT AND NEXT MONTH
-- =====================================================

SELECT public.create_audit_log_partition(
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER
);

SELECT public.create_audit_log_partition(
  EXTRACT(YEAR FROM (CURRENT_DATE + INTERVAL '1 month'))::INTEGER,
  EXTRACT(MONTH FROM (CURRENT_DATE + INTERVAL '1 month'))::INTEGER
);

-- =====================================================
-- 9. UPDATE STATISTICS
-- =====================================================

ANALYZE public.tenants;
ANALYZE public.organizations;
ANALYZE public.users;
ANALYZE public.user_roles;
ANALYZE public.equipment;
ANALYZE public.incidents;
ANALYZE public.notifications;