-- Add missing columns to equipment table
ALTER TABLE public.equipment 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS last_maintenance date,
ADD COLUMN IF NOT EXISTS next_maintenance date;