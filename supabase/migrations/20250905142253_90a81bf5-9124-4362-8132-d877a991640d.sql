-- Complete the seed data - simplified version without ON CONFLICT clauses

-- Create equipment
INSERT INTO public.equipment (
  organization_id,
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
    '11a11a11-1111-4111-a111-111111111111'::uuid,
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
    '22b22b22-2222-4222-b222-222222222222'::uuid,
    'All-Terrain Vehicle 1',
    'Vehicle',
    'Utility ATV Pro',
    'ATV-2024-002',
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
    '55e55e55-5555-4555-e555-555555555555'::uuid,
    'Emergency Medical Kit A',
    'Medical',
    'MedPro Advanced Kit',
    'EMK-2024-003',
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
    '7777a777-7777-4777-a777-777777777777'::uuid,
    'Rope Rescue System',
    'Rescue Gear',
    'Alpine Rescue Pro',
    'ARP-2024-004',
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
  );

-- Create sample notifications
INSERT INTO public.notifications (
  tenant_id,
  user_id,
  title,
  message,
  type,
  metadata
) VALUES 
  (
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
    'b1a11a11-1111-4111-a111-111111111111'::uuid,
    'System Maintenance Scheduled',
    'Routine maintenance will be performed on January 20th from 2:00 AM to 4:00 AM EST.',
    'maintenance',
    '{"priority": "medium", "category": "system"}'::jsonb
  ),
  (
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
    'b2b22b22-2222-4222-b222-222222222222'::uuid,
    'Equipment Assignment Update',
    'All-Terrain Vehicle 1 has been assigned to your location for the current mission.',
    'equipment',
    '{"equipment_id": "ATV-001", "assignment_type": "mission"}'::jsonb
  ),
  (
    'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'::uuid,
    'b3c33c33-3333-4333-c333-333333333333'::uuid,
    'New Team Member Added',
    'Emily Rodriguez has been successfully added to the Mountain Rescue Team Bravo.',
    'user_management',
    '{"new_user_id": "b9999c99-9999-4999-c999-999999999999", "role": "responder"}'::jsonb
  );

-- Create sample incidents
INSERT INTO public.incidents (
  organization_id,
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
    '7777a777-7777-4777-a777-777777777777'::uuid,
    'b7777a77-7777-4777-a777-777777777777'::uuid,
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
    '11a11a11-1111-4111-a111-111111111111'::uuid,
    'b1a11a11-1111-4111-a111-111111111111'::uuid,
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
  );