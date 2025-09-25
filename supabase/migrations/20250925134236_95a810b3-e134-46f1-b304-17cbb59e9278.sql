-- Remove locations and equipment tables and all related components

-- Remove organization audit log references to locations and equipment
DELETE FROM public.audit_logs WHERE resource_type IN ('location', 'equipment');

-- Drop locations table (this will cascade to dependent objects)
DROP TABLE IF EXISTS public.locations CASCADE;

-- Drop equipment table (this will cascade to dependent objects)  
DROP TABLE IF EXISTS public.equipment CASCADE;

-- Remove any functions that might reference these tables
DROP FUNCTION IF EXISTS public.assign_equipment(uuid, uuid) CASCADE;