-- =====================================================
-- UPDATE ROLE ENUM TO MATCH FOUNDER REQUIREMENTS
-- Add missing roles: responder, team_leader
-- =====================================================

-- Add the missing roles to the enum
ALTER TYPE public.role_type ADD VALUE 'responder';
ALTER TYPE public.role_type ADD VALUE 'team_leader';

-- Now let's update existing users to use the new role mappings
-- Map organization_admin and supervisor -> team_leader
UPDATE public.user_roles 
SET role_type = 'team_leader' 
WHERE role_type = 'organization_admin';

-- Map member -> responder  
UPDATE public.user_roles 
SET role_type = 'responder' 
WHERE role_type = 'member';

-- Note: enterprise_admin, platform_admin, and observer remain the same