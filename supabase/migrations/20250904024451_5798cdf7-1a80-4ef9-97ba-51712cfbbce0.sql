-- =====================================================
-- MISSIONLOG DATABASE COMPLETION - FINAL PHASE
-- Essential Constraints and Basic Sample Data
-- =====================================================

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add foreign key reference for department head to users
ALTER TABLE public.departments 
ADD CONSTRAINT fk_departments_head_user 
FOREIGN KEY (head_user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- =====================================================
-- 2. CREATE ONE SAMPLE TENANT AND ORGANIZATION
-- =====================================================

-- Create a basic sample setup for testing
DO $$
DECLARE
  v_tenant_id UUID;
  v_org_id UUID;
  v_admin_user_id UUID;
BEGIN
  -- Insert sample tenant
  INSERT INTO public.tenants (name, slug, subscription_tier, max_organizations, max_users) 
  VALUES ('Demo Emergency Services', 'demo-emergency', 'professional', 5, 100)
  RETURNING id INTO v_tenant_id;

  -- Insert sample organization
  INSERT INTO public.organizations (tenant_id, name, slug, organization_type, description, contact_email) 
  VALUES (v_tenant_id, 'Demo Search & Rescue', 'demo-sar', 'search_and_rescue', 'Demonstration search and rescue unit', 'demo@example.com')
  RETURNING id INTO v_org_id;

  -- Create demo admin user
  INSERT INTO public.users (
    tenant_id, organization_id, email, full_name, status, email_verified
  ) VALUES (
    v_tenant_id, v_org_id, 'admin@demo.com', 'Demo Administrator', 'active', true
  ) RETURNING id INTO v_admin_user_id;
  
  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role_type, organization_id, is_active) 
  VALUES (v_admin_user_id, 'organization_admin', v_org_id, true);

  -- Create demo department
  INSERT INTO public.departments (organization_id, name, description, head_user_id) 
  VALUES (v_org_id, 'Operations', 'Primary response operations', v_admin_user_id);

  -- Create demo location  
  INSERT INTO public.locations (organization_id, name, description) 
  VALUES (v_org_id, 'Headquarters', 'Main operational base');

  -- Create some demo equipment
  INSERT INTO public.equipment (organization_id, name, category, status, serial_number) VALUES
  (v_org_id, 'Radio Unit 1', 'Communications', 'available', 'DEMO-RADIO-001'),
  (v_org_id, 'First Aid Kit 1', 'Medical', 'available', 'DEMO-MEDICAL-001'),
  (v_org_id, 'Rescue Rope 1', 'Rescue', 'available', 'DEMO-RESCUE-001');

  -- Log the setup completion
  INSERT INTO public.audit_logs (
    tenant_id, user_id, action, resource_type, resource_id, new_values
  ) VALUES (
    v_tenant_id, v_admin_user_id, 'SYSTEM_SETUP', 'database', v_tenant_id,
    jsonb_build_object('message', 'Database setup completed successfully')
  );

END $$;

-- =====================================================
-- 3. CREATE MONTHLY AUDIT LOG PARTITIONS
-- =====================================================

-- Create partitions for current and next 3 months
SELECT public.create_audit_log_partition(
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER
);

SELECT public.create_audit_log_partition(
  EXTRACT(YEAR FROM (CURRENT_DATE + INTERVAL '1 month'))::INTEGER,
  EXTRACT(MONTH FROM (CURRENT_DATE + INTERVAL '1 month'))::INTEGER
);

SELECT public.create_audit_log_partition(
  EXTRACT(YEAR FROM (CURRENT_DATE + INTERVAL '2 month'))::INTEGER,
  EXTRACT(MONTH FROM (CURRENT_DATE + INTERVAL '2 month'))::INTEGER
);

-- =====================================================
-- 4. CREATE DEFAULT REPORT TEMPLATE
-- =====================================================

DO $$
DECLARE
  v_org_id UUID;
  v_admin_id UUID;
BEGIN
  -- Get the demo organization and admin
  SELECT o.id, u.id INTO v_org_id, v_admin_id
  FROM public.organizations o
  JOIN public.users u ON u.organization_id = o.id
  JOIN public.user_roles ur ON ur.user_id = u.id
  WHERE o.slug = 'demo-sar' AND ur.role_type = 'organization_admin'
  LIMIT 1;

  IF v_org_id IS NOT NULL AND v_admin_id IS NOT NULL THEN
    INSERT INTO public.report_templates (
      organization_id, name, description, template_schema, created_by, is_active
    ) VALUES (
      v_org_id,
      'Basic Incident Report',
      'Standard incident reporting template for emergency services',
      '{
        "fields": [
          {"name": "incident_number", "type": "text", "required": true, "label": "Incident Number"},
          {"name": "date_time", "type": "datetime", "required": true, "label": "Date & Time"},
          {"name": "location", "type": "text", "required": true, "label": "Location"},
          {"name": "description", "type": "textarea", "required": true, "label": "Description"},
          {"name": "priority", "type": "select", "options": ["Low", "Medium", "High", "Critical"], "required": true, "label": "Priority Level"},
          {"name": "status", "type": "select", "options": ["Open", "In Progress", "Resolved", "Closed"], "required": true, "label": "Status"},
          {"name": "responders", "type": "text", "label": "Primary Responders"},
          {"name": "outcome", "type": "textarea", "label": "Outcome/Resolution"}
        ]
      }'::jsonb,
      v_admin_id,
      true
    );
  END IF;
END $$;

-- =====================================================
-- 5. FINAL STATISTICS UPDATE
-- =====================================================

ANALYZE public.tenants;
ANALYZE public.organizations;
ANALYZE public.departments;
ANALYZE public.locations;
ANALYZE public.users;
ANALYZE public.user_roles;
ANALYZE public.equipment;
ANALYZE public.incidents;
ANALYZE public.report_templates;
ANALYZE public.notifications;
ANALYZE public.audit_logs;