-- Comprehensive seed data migration to populate database with frontend mock data
-- Fixed version with proper UUIDs

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
  'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
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
    '11111111-1111-1111-1111-111111111111'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
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
    '22222222-2222-2222-2222-222222222222'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
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
    '33333333-3333-3333-3333-333333333333'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
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
    '44444444-4444-4444-4444-444444444444'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
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
    '55555555-5555-5555-5555-555555555555'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
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
    '66666666-6666-6666-6666-666666666666'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
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
    '77777777-7777-7777-7777-777777777777'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
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
    '88888888-8888-8888-8888-888888888888'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
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
    '99999999-9999-9999-9999-999999999999'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
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
  ('a1111111-1111-1111-1111-111111111111'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Operations', 'Manufacturing operations and production', true),
  ('a2222222-2222-2222-2222-222222222222'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Safety', 'Industrial safety and compliance', true),
  ('a3333333-3333-3333-3333-333333333333'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Logistics', 'Supply chain and transportation', true),
  ('a4444444-4444-4444-4444-444444444444'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'Research & Development', 'Innovation and product development', true),
  ('a5555555-5555-5555-5555-555555555555'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'Energy Division', 'Power generation and distribution', true),
  ('a6666666-6666-6666-6666-666666666666'::uuid, '55555555-5555-5555-5555-555555555555'::uuid, 'Healthcare', 'Medical services and patient care', true),
  ('a7777777-7777-7777-7777-777777777777'::uuid, '66666666-6666-6666-6666-666666666666'::uuid, 'Finance', 'Financial planning and operations', true),
  ('a8888888-8888-8888-8888-888888888888'::uuid, '77777777-7777-7777-7777-777777777777'::uuid, 'Search & Rescue', 'Emergency response operations', true),
  ('a9999999-9999-9999-9999-999999999999'::uuid, '88888888-8888-8888-8888-888888888888'::uuid, 'Medical Response', 'Emergency medical services', true),
  ('b1111111-1111-1111-1111-111111111111'::uuid, '99999999-9999-9999-9999-999999999999'::uuid, 'Park Rangers', 'Conservation and visitor services', true)
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
    'u1111111-1111-1111-1111-111111111111'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'a1111111-1111-1111-1111-111111111111'::uuid,
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
    'u2222222-2222-2222-2222-222222222222'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid, 
    'a3333333-3333-3333-3333-333333333333'::uuid,
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
    'u3333333-3333-3333-3333-333333333333'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid,
    'a4444444-4444-4444-4444-444444444444'::uuid,
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
    'u4444444-4444-4444-4444-444444444444'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
    '44444444-4444-4444-4444-444444444444'::uuid,
    'a5555555-5555-5555-5555-555555555555'::uuid,
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
    'u5555555-5555-5555-5555-555555555555'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid,
    'a6666666-6666-6666-6666-666666666666'::uuid, 
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
    'u6666666-6666-6666-6666-666666666666'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
    '66666666-6666-6666-6666-666666666666'::uuid,
    'a7777777-7777-7777-7777-777777777777'::uuid,
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
  ),
  -- Team Members (from TeamDirectory mock data)
  (
    'u7777777-7777-7777-7777-777777777777'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
    '77777777-7777-7777-7777-777777777777'::uuid,
    'a8888888-8888-8888-8888-888888888888'::uuid,
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
    'u8888888-8888-8888-8888-888888888888'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
    '77777777-7777-7777-7777-777777777777'::uuid,
    'a8888888-8888-8888-8888-888888888888'::uuid,
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
    'u9999999-9999-9999-9999-999999999999'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
    '77777777-7777-7777-7777-777777777777'::uuid,
    'a8888888-8888-8888-8888-888888888888'::uuid,
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