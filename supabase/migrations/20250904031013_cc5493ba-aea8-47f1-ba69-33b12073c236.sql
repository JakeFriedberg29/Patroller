-- =====================================================
-- ADD NEW ROLE ENUM VALUES 
-- Step 1: Just add the enum values
-- =====================================================

-- Add the missing roles to the enum
ALTER TYPE public.role_type ADD VALUE 'responder';
ALTER TYPE public.role_type ADD VALUE 'team_leader';