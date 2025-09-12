-- Fix schema inconsistency causing TypeScript type generation errors
-- Drop the tenants view that's duplicating the enterprises table
DROP VIEW IF EXISTS public.tenants;

-- Add comment to indicate this fixes type generation
COMMENT ON TABLE public.enterprises IS 'Main tenant/enterprise table - tenants view removed to fix type generation';