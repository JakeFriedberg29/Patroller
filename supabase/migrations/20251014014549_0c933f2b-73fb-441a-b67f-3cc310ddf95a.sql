-- Remove all references to departments and locations (safe version)
-- This migration removes deprecated features that are no longer part of the platform

-- Step 1: Safely drop location_id columns from tables if they exist
DO $$ 
BEGIN
  -- Drop location_id from equipment if column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'equipment' 
    AND column_name = 'location_id'
  ) THEN
    ALTER TABLE public.equipment DROP CONSTRAINT IF EXISTS equipment_location_id_fkey;
    ALTER TABLE public.equipment DROP COLUMN location_id;
  END IF;

  -- Drop location_id from incidents if column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'incidents' 
    AND column_name = 'location_id'
  ) THEN
    ALTER TABLE public.incidents DROP CONSTRAINT IF EXISTS incidents_location_id_fkey;
    ALTER TABLE public.incidents DROP COLUMN location_id;
  END IF;

  -- Drop department_id from users if column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'department_id'
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_department_id_fkey;
    ALTER TABLE public.users DROP COLUMN department_id;
  END IF;
END $$;

-- Step 2: Drop locations table if it exists
DROP TABLE IF EXISTS public.locations CASCADE;

-- Step 3: Drop departments table if it exists
DROP TABLE IF EXISTS public.departments CASCADE;