-- Comprehensive seed data migration to populate database with frontend mock data
-- Fixed version with proper UUID format

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
    '11a11a11-1111-4111-a111-111111111111'::uuid,
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
    '22b22b22-2222-4222-b222-222222222222'::uuid,
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
    '33c33c33-3333-4333-c333-333333333333'::uuid,
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
    '44d44d44-4444-4444-d444-444444444444'::uuid,
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
    '55e55e55-5555-4555-e555-555555555555'::uuid,
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
    '66f66f66-6666-4666-f666-666666666666'::uuid,
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
    '7777a777-7777-4777-a777-777777777777'::uuid,
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
  )
ON CONFLICT (id) DO NOTHING;

-- Create users with roles
INSERT INTO public.users (
  id,
  tenant_id,
  organization_id,
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
    'b1a11a11-1111-4111-a111-111111111111'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
    '11a11a11-1111-4111-a111-111111111111'::uuid,
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
    'b2b22b22-2222-4222-b222-222222222222'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
    '22b22b22-2222-4222-b222-222222222222'::uuid,
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
    'b3c33c33-3333-4333-c333-333333333333'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
    '33c33c33-3333-4333-c333-333333333333'::uuid,
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
    'b4d44d44-4444-4444-d444-444444444444'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
    '44d44d44-4444-4444-d444-444444444444'::uuid,
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
    'b5e55e55-5555-4555-e555-555555555555'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
    '55e55e55-5555-4555-e555-555555555555'::uuid,
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
    'b6f66f66-6666-4666-f666-666666666666'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
    '66f66f66-6666-4666-f666-666666666666'::uuid,
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
    'b7777a77-7777-4777-a777-777777777777'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
    '7777a777-7777-4777-a777-777777777777'::uuid,
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
    'b8888b88-8888-4888-b888-888888888888'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
    '7777a777-7777-4777-a777-777777777777'::uuid,
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
    'b9999c99-9999-4999-c999-999999999999'::uuid,
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
    '7777a777-7777-4777-a777-777777777777'::uuid,
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
  ('b1a11a11-1111-4111-a111-111111111111'::uuid, 'enterprise_admin', '11a11a11-1111-4111-a111-111111111111'::uuid, true, 'sarah.johnson@megacorp.com'),
  ('b2b22b22-2222-4222-b222-222222222222'::uuid, 'enterprise_admin', '22b22b22-2222-4222-b222-222222222222'::uuid, true, 'mike.chen@megacorp.com'),
  ('b3c33c33-3333-4333-c333-333333333333'::uuid, 'enterprise_admin', '33c33c33-3333-4333-c333-333333333333'::uuid, true, 'emily.rodriguez@megacorp.com'),
  ('b4d44d44-4444-4444-d444-444444444444'::uuid, 'enterprise_admin', '44d44d44-4444-4444-d444-444444444444'::uuid, true, 'robert.davis@megacorp.com'),
  ('b5e55e55-5555-4555-e555-555555555555'::uuid, 'enterprise_admin', '55e55e55-5555-4555-e555-555555555555'::uuid, true, 'lisa.thompson@megacorp.com'),
  ('b6f66f66-6666-4666-f666-666666666666'::uuid, 'enterprise_admin', '66f66f66-6666-4666-f666-666666666666'::uuid, true, 'james.wilson@megacorp.com'),
  
  -- Team Members
  ('b7777a77-7777-4777-a777-777777777777'::uuid, 'organization_admin', '7777a777-7777-4777-a777-777777777777'::uuid, true, 'sarah.johnson@example.com'),
  ('b8888b88-8888-4888-b888-888888888888'::uuid, 'responder', '7777a777-7777-4777-a777-777777777777'::uuid, true, 'mike.chen@example.com'),
  ('b9999c99-9999-4999-c999-999999999999'::uuid, 'responder', '7777a777-7777-4777-a777-777777777777'::uuid, true, 'emily.rodriguez@example.com')
ON CONFLICT DO NOTHING;