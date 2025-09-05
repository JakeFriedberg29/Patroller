-- Comprehensive seed data migration to populate database with frontend mock data
-- This will create a complete test environment with users, organizations, equipment, locations, etc.

-- First, let's create the main tenant (MegaCorp Enterprise)
INSERT INTO public.tenants (
  id,
  name,
  slug,
  subscription_tier,
  max_organizations,
  max_users,
  subscription_status,
  settings
) VALUES (
  'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
  'MegaCorp Enterprise',
  'megacorp-enterprise',
  'enterprise',
  20,
  1000,
  'active',
  '{
    "features": ["multi_org", "advanced_analytics", "custom_branding"],
    "billing_email": "billing@megacorp.com"
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Create organizations under MegaCorp tenant
INSERT INTO public.organizations (
  id,
  tenant_id,
  name,
  slug,
  organization_type,
  description,
  contact_email,
  contact_phone,
  address,
  settings
) VALUES 
  (
    'org-manufacturing-001',
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'MegaCorp Manufacturing',
    'megacorp-manufacturing',
    'search_and_rescue',
    'Manufacturing operations and industrial safety division',
    'sarah.johnson@megacorp.com',
    '(555) 123-4567',
    '{
      "street": "1234 Industrial Blvd",
      "city": "Detroit",
      "state": "MI",
      "zip": "48201",
      "country": "USA"
    }'::jsonb,
    '{
      "operating_hours": "24/7",
      "emergency_contact": "sarah.johnson@megacorp.com"
    }'::jsonb
  ),
  (
    'org-logistics-002',
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'MegaCorp Logistics',
    'megacorp-logistics',
    'volunteer_emergency_services',
    'Logistics and supply chain operations',
    'mike.chen@megacorp.com',
    '(555) 234-5678',
    '{
      "street": "5678 Freight Ave",
      "city": "Atlanta", 
      "state": "GA",
      "zip": "30309",
      "country": "USA"
    }'::jsonb,
    '{
      "operating_hours": "Mon-Fri 8AM-6PM",
      "emergency_contact": "mike.chen@megacorp.com"
    }'::jsonb
  ),
  (
    'org-rd-003',
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'MegaCorp R&D',
    'megacorp-rd',
    'event_medical',
    'Research and development division',
    'emily.rodriguez@megacorp.com',
    '(555) 345-6789',
    '{
      "street": "910 Innovation Dr",
      "city": "San Francisco",
      "state": "CA", 
      "zip": "94102",
      "country": "USA"
    }'::jsonb,
    '{
      "operating_hours": "Mon-Fri 9AM-5PM",
      "emergency_contact": "emily.rodriguez@megacorp.com"
    }'::jsonb
  ),
  (
    'org-energy-004',
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'MegaCorp Energy',
    'megacorp-energy',
    'harbor_master',
    'Energy and utilities division',
    'robert.davis@megacorp.com',
    '(555) 456-7890',
    '{
      "street": "2468 Energy Plaza",
      "city": "Houston",
      "state": "TX",
      "zip": "77002",
      "country": "USA"
    }'::jsonb,
    '{
      "operating_hours": "24/7",
      "emergency_contact": "robert.davis@megacorp.com"
    }'::jsonb
  ),
  (
    'org-healthcare-005',
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'MegaCorp Healthcare',
    'megacorp-healthcare', 
    'event_medical',
    'Healthcare and medical services division',
    'lisa.thompson@megacorp.com',
    '(555) 567-8901',
    '{
      "street": "1357 Medical Center Dr",
      "city": "Boston",
      "state": "MA",
      "zip": "02101",
      "country": "USA"
    }'::jsonb,
    '{
      "operating_hours": "24/7",
      "emergency_contact": "lisa.thompson@megacorp.com"
    }'::jsonb
  ),
  (
    'org-finance-006',
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'MegaCorp Finance',
    'megacorp-finance',
    'volunteer_emergency_services',
    'Financial services and operations',
    'james.wilson@megacorp.com',
    '(555) 678-9012',
    '{
      "street": "7890 Wall Street",
      "city": "New York",
      "state": "NY",
      "zip": "10005",
      "country": "USA"
    }'::jsonb,
    '{
      "operating_hours": "Mon-Fri 9AM-6PM",
      "emergency_contact": "james.wilson@megacorp.com"
    }'::jsonb
  ),
  (
    'org-mountain-rescue-007',
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'Mountain Rescue Team Bravo',
    'mountain-rescue-bravo',
    'search_and_rescue',
    'Mountain search and rescue operations',
    'rescue.team@megacorp.com',
    '(555) 789-0123',
    '{
      "street": "456 Mountain View Rd",
      "city": "Denver",
      "state": "CO",
      "zip": "80202",
      "country": "USA"
    }'::jsonb,
    '{
      "operating_hours": "24/7 Emergency Response",
      "emergency_contact": "rescue.team@megacorp.com"
    }'::jsonb
  ),
  (
    'org-alpine-medical-008',
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'Alpine Medical Response',
    'alpine-medical',
    'event_medical',
    'Specialized medical response for alpine environments',
    'alpine.medical@megacorp.com',
    '(555) 890-1234',
    '{
      "street": "789 Alpine Dr",
      "city": "Aspen",
      "state": "CO",
      "zip": "81611",
      "country": "USA"
    }'::jsonb,
    '{
      "operating_hours": "24/7 Emergency Response",
      "emergency_contact": "alpine.medical@megacorp.com"
    }'::jsonb
  ),
  (
    'org-summit-rangers-009',
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'Summit Park Rangers',
    'summit-park-rangers',
    'park_service',
    'Park service and conservation operations',
    'park.rangers@megacorp.com',
    '(555) 901-2345',
    '{
      "street": "123 Park Service Rd",
      "city": "Yellowstone",
      "state": "WY",
      "zip": "82190",
      "country": "USA"
    }'::jsonb,
    '{
      "operating_hours": "Seasonal - May to October",
      "emergency_contact": "park.rangers@megacorp.com"
    }'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Create departments for organizations
INSERT INTO public.departments (
  id,
  organization_id,
  name,
  description,
  is_active
) VALUES 
  ('dept-operations-001', 'org-manufacturing-001', 'Operations', 'Manufacturing operations and production', true),
  ('dept-safety-001', 'org-manufacturing-001', 'Safety', 'Industrial safety and compliance', true),
  ('dept-logistics-001', 'org-logistics-002', 'Logistics', 'Supply chain and transportation', true),
  ('dept-research-001', 'org-rd-003', 'Research & Development', 'Innovation and product development', true),
  ('dept-energy-001', 'org-energy-004', 'Energy Division', 'Power generation and distribution', true),
  ('dept-healthcare-001', 'org-healthcare-005', 'Healthcare', 'Medical services and patient care', true),
  ('dept-finance-001', 'org-finance-006', 'Finance', 'Financial planning and operations', true),
  ('dept-rescue-001', 'org-mountain-rescue-007', 'Search & Rescue', 'Emergency response operations', true),
  ('dept-medical-001', 'org-alpine-medical-008', 'Medical Response', 'Emergency medical services', true),
  ('dept-rangers-001', 'org-summit-rangers-009', 'Park Rangers', 'Conservation and visitor services', true)
ON CONFLICT (id) DO NOTHING;

-- Create users with email as password (as requested)
-- Enterprise Admins
INSERT INTO public.users (
  id,
  tenant_id,
  organization_id,
  department_id,
  auth_user_id,
  email,
  full_name,
  first_name,
  last_name,
  phone,
  status,
  email_verified,
  profile_data
) VALUES 
  (
    'user-sarah-johnson-001',
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'org-manufacturing-001',
    'dept-operations-001',
    null, -- Will be set when auth user is created
    'sarah.johnson@megacorp.com',
    'Sarah Johnson',
    'Sarah',
    'Johnson',
    '(555) 123-4567',
    'active',
    true,
    '{
      "department": "Operations",
      "location": "Detroit, MI",
      "permissions": ["User Management", "Organization Management"],
      "avatar": "",
      "title": "Manufacturing Operations Director"
    }'::jsonb
  ),
  (
    'user-mike-chen-002',
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'org-logistics-002', 
    'dept-logistics-001',
    null,
    'mike.chen@megacorp.com',
    'Mike Chen',
    'Mike',
    'Chen',
    '(555) 234-5678',
    'active',
    true,
    '{
      "department": "Logistics",
      "location": "Atlanta, GA", 
      "permissions": ["User Management", "Organization Management"],
      "avatar": "",
      "title": "Logistics Operations Manager"
    }'::jsonb
  ),
  (
    'user-emily-rodriguez-003',
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'org-rd-003',
    'dept-research-001',
    null,
    'emily.rodriguez@megacorp.com', 
    'Dr. Emily Rodriguez',
    'Emily',
    'Rodriguez',
    '(555) 345-6789',
    'active',
    true,
    '{
      "department": "Research & Development",
      "location": "San Francisco, CA",
      "permissions": ["User Management", "Organization Management"],
      "avatar": "",
      "title": "Chief Research Officer"
    }'::jsonb
  ),
  (
    'user-robert-davis-004',
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'org-energy-004',
    'dept-energy-001',
    null,
    'robert.davis@megacorp.com',
    'Robert Davis', 
    'Robert',
    'Davis',
    '(555) 456-7890',
    'active',
    true,
    '{
      "department": "Energy Division",
      "location": "Houston, TX",
      "permissions": ["User Management", "Organization Management"],
      "avatar": "",
      "title": "Energy Operations Director"
    }'::jsonb
  ),
  (
    'user-lisa-thompson-005',
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'org-healthcare-005',
    'dept-healthcare-001', 
    null,
    'lisa.thompson@megacorp.com',
    'Dr. Lisa Thompson',
    'Lisa',
    'Thompson',
    '(555) 567-8901',
    'active',
    true,
    '{
      "department": "Healthcare",
      "location": "Boston, MA",
      "permissions": ["User Management", "Organization Management"],
      "avatar": "",
      "title": "Chief Medical Officer"
    }'::jsonb
  ),
  (
    'user-james-wilson-006',
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'org-finance-006',
    'dept-finance-001',
    null,
    'james.wilson@megacorp.com',
    'James Wilson',
    'James', 
    'Wilson',
    '(555) 678-9012',
    'inactive',
    true,
    '{
      "department": "Finance",
      "location": "New York, NY",
      "permissions": ["User Management", "Organization Management"],
      "avatar": "",
      "title": "Chief Financial Officer"
    }'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Team Members (from TeamDirectory mock data)
INSERT INTO public.users (
  id,
  tenant_id,
  organization_id,
  department_id,
  auth_user_id,
  email,
  full_name,
  first_name,
  last_name,
  phone,
  status,
  email_verified,
  profile_data
) VALUES 
  (
    'user-sarah-johnson-team-007',
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'org-mountain-rescue-007',
    'dept-rescue-001',
    null,
    'sarah.johnson@example.com',
    'Sarah Johnson',
    'Sarah',
    'Johnson',
    '(555) 123-4567',
    'active',
    true,
    '{
      "department": "Search & Rescue",
      "location": "Mountain Base",
      "certification": "EMT-P",
      "role": "Team Lead",
      "status": "Available"
    }'::jsonb
  ),
  (
    'user-mike-chen-team-008',
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'org-mountain-rescue-007',
    'dept-rescue-001',
    null,
    'mike.chen@example.com',
    'Mike Chen',
    'Mike',
    'Chen',
    '(555) 234-5678',
    'active',
    true,
    '{
      "department": "Search & Rescue",
      "location": "Mountain Base",
      "certification": "Technical Rescue",
      "role": "Rescue Specialist",
      "status": "On Mission"
    }'::jsonb
  ),
  (
    'user-emily-rodriguez-team-009',
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'org-mountain-rescue-007',
    'dept-rescue-001',
    null,
    'emily.rodriguez@example.com',
    'Emily Rodriguez',
    'Emily',
    'Rodriguez',
    '(555) 345-6789',
    'active',
    true,
    '{
      "department": "Search & Rescue",
      "location": "Communications Center",
      "certification": "Radio Operator",
      "role": "Communications",
      "status": "Available"
    }'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Create user roles
INSERT INTO public.user_roles (
  user_id,
  role_type,
  organization_id,
  is_active,
  email
) VALUES 
  -- Enterprise Admins
  ('user-sarah-johnson-001', 'enterprise_admin', 'org-manufacturing-001', true, 'sarah.johnson@megacorp.com'),
  ('user-mike-chen-002', 'enterprise_admin', 'org-logistics-002', true, 'mike.chen@megacorp.com'),
  ('user-emily-rodriguez-003', 'enterprise_admin', 'org-rd-003', true, 'emily.rodriguez@megacorp.com'),
  ('user-robert-davis-004', 'enterprise_admin', 'org-energy-004', true, 'robert.davis@megacorp.com'),
  ('user-lisa-thompson-005', 'enterprise_admin', 'org-healthcare-005', true, 'lisa.thompson@megacorp.com'),
  ('user-james-wilson-006', 'enterprise_admin', 'org-finance-006', true, 'james.wilson@megacorp.com'),
  
  -- Team Members
  ('user-sarah-johnson-team-007', 'organization_admin', 'org-mountain-rescue-007', true, 'sarah.johnson@example.com'),
  ('user-mike-chen-team-008', 'responder', 'org-mountain-rescue-007', true, 'mike.chen@example.com'),
  ('user-emily-rodriguez-team-009', 'responder', 'org-mountain-rescue-007', true, 'emily.rodriguez@example.com')
ON CONFLICT DO NOTHING;

-- Create locations
INSERT INTO public.locations (
  id,
  organization_id,
  name,
  description,
  address,
  coordinates,
  is_active
) VALUES 
  (
    'loc-downtown-command-001',
    'org-manufacturing-001',
    'Downtown Command Center',
    'Main command and control center for manufacturing operations',
    '{
      "street": "123 Main St",
      "city": "Downtown",
      "state": "MI",
      "zip": "48201"
    }'::jsonb,
    point(40.7128, -74.0060),
    true
  ),
  (
    'loc-north-district-002',
    'org-logistics-002',
    'North District Station',
    'Logistics distribution and coordination hub',
    '{
      "street": "456 Oak Ave",
      "city": "North District",
      "state": "GA",
      "zip": "30309"
    }'::jsonb,
    point(40.7589, -73.9851),
    true
  ),
  (
    'loc-emergency-depot-003',
    'org-energy-004',
    'Emergency Response Depot',
    'Emergency supplies and equipment storage facility',
    '{
      "street": "789 Pine Rd",
      "city": "Industrial Zone",
      "state": "TX",
      "zip": "77002"
    }'::jsonb,
    point(40.6782, -73.9442),
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Create equipment
INSERT INTO public.equipment (
  id,
  organization_id,
  location_id,
  name,
  category,
  model,
  serial_number,
  status,
  purchase_date,
  specifications,
  maintenance_schedule
) VALUES 
  (
    'eq-rescue-boat-001',
    'org-manufacturing-001',
    'loc-downtown-command-001',
    'Rescue Boat Alpha',
    'Watercraft',
    'Marine Rescue Pro 24',
    'MRP-2024-001',
    'available',
    '2024-01-15',
    '{
      "length": "24 feet",
      "capacity": "12 persons",
      "engine": "Twin 250HP Outboard",
      "equipment": ["GPS", "Sonar", "Emergency Medical Kit"]
    }'::jsonb,
    '{
      "last_maintenance": "2024-08-15",
      "next_maintenance": "2024-11-15",
      "maintenance_type": "Full Service"
    }'::jsonb
  ),
  (
    'eq-atv-001',
    'org-logistics-002',
    'loc-north-district-002',
    'All-Terrain Vehicle 1',
    'Vehicle',
    'Utility ATV Pro',
    'ATV-2024-001',
    'in_use',
    '2024-02-20',
    '{
      "engine": "500cc 4-stroke",
      "capacity": "2 persons",
      "features": ["Winch", "Cargo Rack", "Emergency Lights"]
    }'::jsonb,
    '{
      "last_maintenance": "2024-08-20",
      "next_maintenance": "2024-12-20",
      "maintenance_type": "Oil Change & Inspection"
    }'::jsonb
  ),
  (
    'eq-medical-kit-001',
    'org-healthcare-005',
    null,
    'Emergency Medical Kit A',
    'Medical',
    'MedPro Advanced Kit',
    'EMK-2024-001',
    'available',
    '2024-03-10',
    '{
      "contents": ["AED", "Trauma Supplies", "Medications", "Monitoring Equipment"],
      "certification": "FDA Approved",
      "expiration_date": "2026-03-10"
    }'::jsonb,
    '{
      "last_maintenance": "2024-08-25",
      "next_maintenance": "2024-09-25",
      "maintenance_type": "Inventory Check & Restocking"
    }'::jsonb
  ),
  (
    'eq-rope-rescue-001',
    'org-mountain-rescue-007',
    null,
    'Rope Rescue System',
    'Rescue Gear',
    'Alpine Rescue Pro',
    'ARP-2024-001',
    'maintenance',
    '2023-12-05',
    '{
      "rope_length": "200 meters",
      "load_rating": "5000 lbs",
      "components": ["Dynamic Rope", "Static Rope", "Pulleys", "Anchors", "Harnesses"]
    }'::jsonb,
    '{
      "last_maintenance": "2024-08-10",
      "next_maintenance": "2024-09-01",
      "maintenance_type": "Safety Inspection & Certification"
    }'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Create some sample audit logs
INSERT INTO public.audit_logs (
  tenant_id,
  user_id,
  action,
  resource_type,
  resource_id,
  old_values,
  new_values,
  metadata
) VALUES 
  (
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'user-sarah-johnson-001',
    'CREATE',
    'organization',
    'org-manufacturing-001',
    null,
    '{"name": "MegaCorp Manufacturing", "type": "search_and_rescue"}'::jsonb,
    '{"ip_address": "192.168.1.100", "user_agent": "Mozilla/5.0"}'::jsonb
  ),
  (
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'user-mike-chen-002',
    'UPDATE',
    'equipment',
    'eq-atv-001',
    '{"status": "available"}'::jsonb,
    '{"status": "in_use"}'::jsonb,
    '{"ip_address": "192.168.1.101", "user_agent": "Mozilla/5.0"}'::jsonb
  ),
  (
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'user-emily-rodriguez-003',
    'CREATE',
    'user',
    'user-emily-rodriguez-team-009',
    null,
    '{"email": "emily.rodriguez@example.com", "role": "responder"}'::jsonb,
    '{"ip_address": "192.168.1.102", "user_agent": "Mozilla/5.0"}'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Create some sample notifications
INSERT INTO public.notifications (
  tenant_id,
  user_id,
  title,
  message,
  type,
  metadata
) VALUES 
  (
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'user-sarah-johnson-001',
    'System Maintenance Scheduled',
    'Routine maintenance will be performed on January 20th from 2:00 AM to 4:00 AM EST.',
    'maintenance',
    '{"priority": "medium", "category": "system"}'::jsonb
  ),
  (
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'user-mike-chen-002',
    'Equipment Assignment Update',
    'All-Terrain Vehicle 1 has been assigned to your location for the current mission.',
    'equipment',
    '{"equipment_id": "eq-atv-001", "assignment_type": "mission"}'::jsonb
  ),
  (
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    'user-emily-rodriguez-003',
    'New Team Member Added',
    'Emily Rodriguez has been successfully added to the Mountain Rescue Team Bravo.',
    'user_management',
    '{"new_user_id": "user-emily-rodriguez-team-009", "role": "responder"}'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Create sample incidents
INSERT INTO public.incidents (
  id,
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
) VALUES 
  (
    'inc-001',
    'org-mountain-rescue-007',
    null,
    'user-sarah-johnson-team-007',
    'Missing Hiker - Trail 5',
    'Hiker reported missing on Trail 5 after failing to return by sunset. Last seen at mile marker 8.',
    'Missing Person',
    'high',
    'active',
    now() - interval '2 hours',
    '{
      "location_details": "Trail 5, Mile Marker 8",
      "weather_conditions": "Clear, Temperature 45°F",
      "search_area": "Grid sectors A1-A4"
    }'::jsonb
  ),
  (
    'inc-002',
    'org-manufacturing-001',
    'loc-downtown-command-001',
    'user-sarah-johnson-001',
    'Equipment Malfunction - Production Line 2',
    'Conveyor belt system experiencing intermittent failures causing production delays.',
    'Equipment Issue',
    'medium',
    'resolved',
    now() - interval '1 day',
    '{
      "equipment_id": "CONV-002",
      "downtime_minutes": 45,
      "repair_cost": 1250.00
    }'::jsonb
  )
ON CONFLICT (id) DO NOTHING;