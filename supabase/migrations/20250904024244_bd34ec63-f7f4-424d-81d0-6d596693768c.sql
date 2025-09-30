-- =====================================================
-- PATROLLER CONSOLE SAMPLE DATA - PHASE 4
-- Development and Testing Data Setup
-- =====================================================

-- =====================================================
-- 1. CREATE SAMPLE TENANTS AND ORGANIZATIONS
-- =====================================================

-- Create sample tenant and organizations for each emergency service type
DO $$
DECLARE
  v_result JSONB;
  v_tenant_id UUID;
  v_org_id UUID;
  v_admin_user_id UUID;
  org_types organization_type[] := ARRAY[
    'search_and_rescue',
    'lifeguard_service', 
    'park_service',
    'event_medical',
    'ski_patrol',
    'harbor_master',
    'volunteer_emergency_services'
  ];
  org_type organization_type;
BEGIN
  -- Create tenant for each organization type
  FOREACH org_type IN ARRAY org_types
  LOOP
    SELECT public.create_tenant_with_organization(
      CASE org_type
        WHEN 'search_and_rescue' THEN 'Mountain Rescue Alliance'
        WHEN 'lifeguard_service' THEN 'Coastal Safety Services'
        WHEN 'park_service' THEN 'National Parks Authority'
        WHEN 'event_medical' THEN 'Event Medical Group'
        WHEN 'ski_patrol' THEN 'Alpine Safety Team'
        WHEN 'harbor_master' THEN 'Maritime Safety Authority'
        WHEN 'volunteer_emergency_services' THEN 'Community Emergency Response'
      END,
      CASE org_type
        WHEN 'search_and_rescue' THEN 'mountain-rescue'
        WHEN 'lifeguard_service' THEN 'coastal-safety'
        WHEN 'park_service' THEN 'parks-authority'
        WHEN 'event_medical' THEN 'event-medical'
        WHEN 'ski_patrol' THEN 'alpine-safety'
        WHEN 'harbor_master' THEN 'maritime-authority'
        WHEN 'volunteer_emergency_services' THEN 'community-emergency'
      END,
      CASE org_type
        WHEN 'search_and_rescue' THEN 'Rocky Mountain Search & Rescue'
        WHEN 'lifeguard_service' THEN 'Pacific Beach Lifeguard Station'
        WHEN 'park_service' THEN 'Yellowstone National Park'
        WHEN 'event_medical' THEN 'Festival Medical Services'
        WHEN 'ski_patrol' THEN 'Aspen Ski Patrol'
        WHEN 'harbor_master' THEN 'San Francisco Bay Authority'
        WHEN 'volunteer_emergency_services' THEN 'Volunteer Fire Department'
      END,
      CASE org_type
        WHEN 'search_and_rescue' THEN 'rocky-mountain-sar'
        WHEN 'lifeguard_service' THEN 'pacific-beach-lg'
        WHEN 'park_service' THEN 'yellowstone-np'
        WHEN 'event_medical' THEN 'festival-medical'
        WHEN 'ski_patrol' THEN 'aspen-patrol'
        WHEN 'harbor_master' THEN 'sf-bay-authority'
        WHEN 'volunteer_emergency_services' THEN 'volunteer-fd'
      END,
      org_type,
      CASE org_type
        WHEN 'search_and_rescue' THEN 'admin@rockymountainsar.org'
        WHEN 'lifeguard_service' THEN 'admin@pacificbeachlifeguards.org'
        WHEN 'park_service' THEN 'admin@yellowstone.gov'
        WHEN 'event_medical' THEN 'admin@festivalmedical.com'
        WHEN 'ski_patrol' THEN 'admin@aspenpatrol.com'
        WHEN 'harbor_master' THEN 'admin@sfbayauthority.gov'
        WHEN 'volunteer_emergency_services' THEN 'admin@volunteerfd.org'
      END,
      CASE org_type
        WHEN 'search_and_rescue' THEN 'Sarah Rodriguez'
        WHEN 'lifeguard_service' THEN 'Mike Thompson'
        WHEN 'park_service' THEN 'Jennifer Park'
        WHEN 'event_medical' THEN 'Dr. Alex Chen'
        WHEN 'ski_patrol' THEN 'Chris Alpine'
        WHEN 'harbor_master' THEN 'Captain Maria Santos'
        WHEN 'volunteer_emergency_services' THEN 'Chief Robert Wilson'
      END,
      'professional'
    ) INTO v_result;
    
    -- Extract IDs for further setup
    v_tenant_id := (v_result->>'tenant_id')::UUID;
    v_org_id := (v_result->>'organization_id')::UUID;
    v_admin_user_id := (v_result->>'admin_user_id')::UUID;
    
    -- Create departments for each organization
    INSERT INTO public.departments (organization_id, name, description) VALUES
    (v_org_id, 'Operations', 'Primary operational response team'),
    (v_org_id, 'Training', 'Training and certification department'),
    (v_org_id, 'Equipment', 'Equipment management and maintenance'),
    (v_org_id, 'Communications', 'Radio and communication systems');
    
    -- Create locations for each organization  
    INSERT INTO public.locations (organization_id, name, description, address) VALUES
    (v_org_id, 'Headquarters', 'Main operational base', 
     jsonb_build_object('street', '123 Emergency Way', 'city', 'Safety City', 'state', 'CA', 'zip', '90210')),
    (v_org_id, 'Sector Alpha', 'Northern operational sector',
     jsonb_build_object('street', '456 North Station Rd', 'city', 'Safety City', 'state', 'CA', 'zip', '90211')),
    (v_org_id, 'Sector Bravo', 'Southern operational sector',
     jsonb_build_object('street', '789 South Base Ave', 'city', 'Safety City', 'state', 'CA', 'zip', '90212'));

  END LOOP;
END $$;

-- =====================================================
-- 2. CREATE SAMPLE EQUIPMENT FOR EACH ORGANIZATION
-- =====================================================

DO $$
DECLARE
  org_record RECORD;
  equipment_categories TEXT[];
  category TEXT;
  i INTEGER;
BEGIN
  -- Equipment categories by organization type
  FOR org_record IN 
    SELECT id, organization_type 
    FROM public.organizations 
  LOOP
    equipment_categories := CASE org_record.organization_type
      WHEN 'search_and_rescue' THEN ARRAY['Radios', 'Rescue Ropes', 'First Aid Kits', 'Stretchers', 'ATVs']
      WHEN 'lifeguard_service' THEN ARRAY['Rescue Tubes', 'Life Vests', 'Rescue Boards', 'First Aid Kits', 'Radios']
      WHEN 'park_service' THEN ARRAY['Radios', 'Patrol Vehicles', 'First Aid Kits', 'Fire Extinguishers', 'Signage Tools']
      WHEN 'event_medical' THEN ARRAY['Portable Medical Kits', 'Stretchers', 'Defibrillators', 'Radios', 'Medical Tents']
      WHEN 'ski_patrol' THEN ARRAY['Rescue Sleds', 'Radios', 'Avalanche Gear', 'First Aid Kits', 'Snowmobiles']
      WHEN 'harbor_master' THEN ARRAY['Boats', 'Life Jackets', 'Radios', 'Firefighting Gear', 'Navigation Equipment']
      WHEN 'volunteer_emergency_services' THEN ARRAY['Radios', 'First Aid Kits', 'Flashlights', 'Rescue Ropes', 'Community Vehicles']
    END;
    
    FOREACH category IN ARRAY equipment_categories
    LOOP
      FOR i IN 1..5 LOOP
        INSERT INTO public.equipment (
          organization_id,
          name,
          category,
          model,
          serial_number,
          purchase_date,
          status,
          specifications
        ) VALUES (
          org_record.id,
          category || ' Unit ' || i,
          category,
          'Model-' || UPPER(LEFT(category, 3)) || '-' || i,
          'SN' || TO_CHAR(org_record.id, 'FMXXXXXXXX') || LPAD(i::TEXT, 3, '0'),
          CURRENT_DATE - (RANDOM() * 365 * 2)::INTEGER,
          CASE WHEN RANDOM() < 0.8 THEN 'available'::equipment_status ELSE 'maintenance'::equipment_status END,
          jsonb_build_object(
            'weight', ROUND((RANDOM() * 50 + 5)::NUMERIC, 1) || ' lbs',
            'dimensions', ROUND((RANDOM() * 30 + 10)::NUMERIC, 1) || 'x' || ROUND((RANDOM() * 20 + 5)::NUMERIC, 1) || 'x' || ROUND((RANDOM() * 15 + 3)::NUMERIC, 1) || ' inches',
            'manufacturer', 'SafetyTech Industries'
          )
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- =====================================================
-- 3. CREATE SAMPLE INCIDENTS
-- =====================================================

DO $$
DECLARE
  org_record RECORD;
  user_record RECORD;
  location_record RECORD;
  incident_types TEXT[];
  incident_type TEXT;
  i INTEGER;
BEGIN
  -- Create incidents for each organization
  FOR org_record IN 
    SELECT o.id, o.organization_type, o.name
    FROM public.organizations o
  LOOP
    -- Get users and locations for this organization
    SELECT INTO user_record id FROM public.users WHERE organization_id = org_record.id LIMIT 1;
    SELECT INTO location_record id FROM public.locations WHERE organization_id = org_record.id LIMIT 1;
    
    IF user_record.id IS NOT NULL THEN
      incident_types := CASE org_record.organization_type
        WHEN 'search_and_rescue' THEN ARRAY['Missing Hiker', 'Rock Climbing Accident', 'Lost Child', 'Avalanche Rescue']
        WHEN 'lifeguard_service' THEN ARRAY['Water Rescue', 'Medical Emergency', 'Rip Current', 'Marine Life Incident']
        WHEN 'park_service' THEN ARRAY['Wildlife Encounter', 'Trail Injury', 'Lost Visitor', 'Fire Alert']
        WHEN 'event_medical' THEN ARRAY['Heat Exhaustion', 'Crowd Incident', 'Allergic Reaction', 'Fall Injury']
        WHEN 'ski_patrol' THEN ARRAY['Ski Accident', 'Lift Malfunction', 'Avalanche Warning', 'Equipment Failure']
        WHEN 'harbor_master' THEN ARRAY['Boat Distress', 'Oil Spill', 'Navigation Hazard', 'Marine Emergency']
        WHEN 'volunteer_emergency_services' THEN ARRAY['House Fire', 'Vehicle Accident', 'Medical Call', 'Storm Damage']
      END;
      
      FOREACH incident_type IN ARRAY incident_types
      LOOP
        FOR i IN 1..3 LOOP
          INSERT INTO public.incidents (
            organization_id,
            location_id,
            reported_by,
            title,
            description,
            incident_type,
            priority,
            status,
            occurred_at,
            metadata
          ) VALUES (
            org_record.id,
            location_record.id,
            user_record.id,
            incident_type || ' - Case ' || i,
            'Detailed description of ' || incident_type || ' incident case number ' || i || '. Response initiated immediately with appropriate resources deployed.',
            incident_type,
            CASE WHEN RANDOM() < 0.2 THEN 'critical'::incident_priority
                 WHEN RANDOM() < 0.4 THEN 'high'::incident_priority
                 WHEN RANDOM() < 0.7 THEN 'medium'::incident_priority
                 ELSE 'low'::incident_priority END,
            CASE WHEN RANDOM() < 0.6 THEN 'resolved' ELSE 'open' END,
            now() - (RANDOM() * 30 * 24 * 60 * 60)::INTEGER * INTERVAL '1 second',
            jsonb_build_object(
              'weather', CASE WHEN RANDOM() < 0.5 THEN 'clear' ELSE 'overcast' END,
              'temperature', ROUND((RANDOM() * 40 + 40)::NUMERIC, 1) || '°F',
              'response_time', ROUND((RANDOM() * 20 + 5)::NUMERIC, 1) || ' minutes'
            )
          );
        END LOOP;
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- 4. CREATE SAMPLE REPORT TEMPLATES
-- =====================================================

DO $$
DECLARE
  org_record RECORD;
  admin_user RECORD;
  template_schemas JSONB[];
  template_schema JSONB;
  template_names TEXT[];
  template_name TEXT;
  i INTEGER;
BEGIN
  -- Default report templates for emergency services
  template_names := ARRAY[
    'Incident Report',
    'Patient Care Report', 
    'Rescue Report',
    'Medical/First Aid Report',
    'Equipment Check Report',
    'Training Session Report'
  ];

  template_schemas := ARRAY[
    '{"fields": [{"name": "incident_number", "type": "text", "required": true}, {"name": "date_time", "type": "datetime", "required": true}, {"name": "location", "type": "text", "required": true}, {"name": "description", "type": "textarea", "required": true}, {"name": "personnel_involved", "type": "multiselect", "required": true}, {"name": "weather_conditions", "type": "select", "options": ["Clear", "Overcast", "Rain", "Snow", "Wind"]}, {"name": "outcome", "type": "select", "options": ["Resolved", "Ongoing", "Referred"], "required": true}]}'::jsonb,
    '{"fields": [{"name": "patient_name", "type": "text", "required": true}, {"name": "age", "type": "number", "required": true}, {"name": "gender", "type": "select", "options": ["Male", "Female", "Other"]}, {"name": "chief_complaint", "type": "textarea", "required": true}, {"name": "vital_signs", "type": "group", "fields": [{"name": "blood_pressure", "type": "text"}, {"name": "pulse", "type": "number"}, {"name": "temperature", "type": "number"}]}, {"name": "treatment_provided", "type": "textarea", "required": true}, {"name": "disposition", "type": "select", "options": ["Treated and Released", "Transported", "Refused Treatment"], "required": true}]}'::jsonb,
    '{"fields": [{"name": "rescue_type", "type": "select", "options": ["Water Rescue", "Mountain Rescue", "Technical Rescue", "Urban Rescue"], "required": true}, {"name": "location_coordinates", "type": "text"}, {"name": "rescue_duration", "type": "time", "required": true}, {"name": "equipment_used", "type": "multiselect", "required": true}, {"name": "team_members", "type": "multiselect", "required": true}, {"name": "complications", "type": "textarea"}, {"name": "lessons_learned", "type": "textarea"}]}'::jsonb,
    '{"fields": [{"name": "injury_type", "type": "select", "options": ["Minor Cut", "Sprain", "Fracture", "Burn", "Other"], "required": true}, {"name": "body_part", "type": "text", "required": true}, {"name": "first_aid_given", "type": "textarea", "required": true}, {"name": "medical_history", "type": "textarea"}, {"name": "medications", "type": "text"}, {"name": "allergies", "type": "text"}, {"name": "follow_up_required", "type": "boolean"}]}'::jsonb,
    '{"fields": [{"name": "equipment_category", "type": "select", "options": ["Radio", "Vehicle", "Medical", "Rescue", "Safety"], "required": true}, {"name": "equipment_items", "type": "multiselect", "required": true}, {"name": "inspection_date", "type": "date", "required": true}, {"name": "condition_status", "type": "select", "options": ["Excellent", "Good", "Fair", "Poor", "Out of Service"], "required": true}, {"name": "maintenance_needed", "type": "textarea"}, {"name": "inspector_signature", "type": "text", "required": true}]}'::jsonb,
    '{"fields": [{"name": "training_type", "type": "select", "options": ["CPR/AED", "Technical Rescue", "Water Safety", "Equipment Training"], "required": true}, {"name": "instructor", "type": "text", "required": true}, {"name": "participants", "type": "multiselect", "required": true}, {"name": "duration_hours", "type": "number", "required": true}, {"name": "skills_covered", "type": "textarea", "required": true}, {"name": "certification_issued", "type": "boolean"}, {"name": "next_training_date", "type": "date"}]}'::jsonb
  ];

  FOR org_record IN 
    SELECT o.id, o.organization_type 
    FROM public.organizations o
  LOOP
    -- Get an admin user for this organization
    SELECT INTO admin_user u.id 
    FROM public.users u 
    JOIN public.user_roles ur ON u.id = ur.user_id 
    WHERE u.organization_id = org_record.id 
    AND ur.role_type IN ('organization_admin', 'enterprise_admin')
    LIMIT 1;
    
    IF admin_user.id IS NOT NULL THEN
      FOR i IN 1..array_length(template_names, 1) LOOP
        INSERT INTO public.report_templates (
          organization_id,
          name,
          description,
          template_schema,
          created_by,
          is_active
        ) VALUES (
          org_record.id,
          template_names[i],
          'Standard ' || template_names[i] || ' template for ' || org_record.organization_type || ' operations',
          template_schemas[i],
          admin_user.id,
          true
        );
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- 5. CREATE SAMPLE NOTIFICATIONS
-- =====================================================

DO $$
DECLARE
  user_record RECORD;
  notification_messages TEXT[];
  notification_message TEXT;
BEGIN
  notification_messages := ARRAY[
    'Welcome to Patroller Console! Your account has been activated.',
    'System maintenance scheduled for this weekend. Please prepare accordingly.',
    'New training materials available in the resource center.',
    'Equipment inspection due - please check your assigned items.',
    'Monthly safety briefing scheduled for next week.',
    'Emergency drill results: Excellent response time achieved!'
  ];

  FOR user_record IN 
    SELECT u.id, u.tenant_id, u.full_name
    FROM public.users u
    LIMIT 10  -- Create notifications for first 10 users
  LOOP
    FOREACH notification_message IN ARRAY notification_messages
    LOOP
      -- Create some notifications (not all for each user)
      IF RANDOM() < 0.4 THEN
        INSERT INTO public.notifications (
          tenant_id,
          user_id,
          title,
          message,
          type,
          read,
          created_at
        ) VALUES (
          user_record.tenant_id,
          user_record.id,
          CASE 
            WHEN notification_message LIKE '%Welcome%' THEN 'Welcome!'
            WHEN notification_message LIKE '%maintenance%' THEN 'System Maintenance'
            WHEN notification_message LIKE '%training%' THEN 'Training Update'
            WHEN notification_message LIKE '%inspection%' THEN 'Equipment Alert'
            WHEN notification_message LIKE '%briefing%' THEN 'Safety Briefing'
            ELSE 'Drill Results'
          END,
          notification_message,
          CASE 
            WHEN notification_message LIKE '%Welcome%' THEN 'success'
            WHEN notification_message LIKE '%maintenance%' THEN 'warning'
            WHEN notification_message LIKE '%inspection%' THEN 'warning'
            ELSE 'info'
          END,
          RANDOM() < 0.3, -- 30% chance notification is read
          now() - (RANDOM() * 7 * 24 * 60 * 60)::INTEGER * INTERVAL '1 second'
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- =====================================================
-- 6. CREATE AUDIT LOG PARTITIONS FOR NEXT 6 MONTHS
-- =====================================================

DO $$
DECLARE
  current_date DATE := CURRENT_DATE;
  partition_date DATE;
  i INTEGER;
BEGIN
  FOR i IN 0..5 LOOP
    partition_date := date_trunc('month', current_date) + (i || ' months')::INTERVAL;
    PERFORM public.create_audit_log_partition(
      EXTRACT(YEAR FROM partition_date)::INTEGER,
      EXTRACT(MONTH FROM partition_date)::INTEGER
    );
  END LOOP;
END $$;

-- =====================================================
-- 7. UPDATE STATISTICS FOR BETTER QUERY PERFORMANCE
-- =====================================================

ANALYZE public.tenants;
ANALYZE public.organizations;
ANALYZE public.users;
ANALYZE public.user_roles;
ANALYZE public.equipment;
ANALYZE public.incidents;
ANALYZE public.notifications;
ANALYZE public.audit_logs;