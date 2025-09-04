-- =====================================================
-- UPDATE ROLE SYSTEM TO MATCH FOUNDER REQUIREMENTS
-- Align roles: Platform Admin, Enterprise Admin, Team Leader, Responder, Observer
-- =====================================================

-- First, update the role enum to match founder requirements
-- We need to add the new roles and remove/rename the old ones
ALTER TYPE public.role_type RENAME TO role_type_old;

CREATE TYPE public.role_type AS ENUM (
  'platform_admin',
  'enterprise_admin', 
  'team_leader',
  'responder',
  'observer'
);

-- Update user_roles table to use new enum
ALTER TABLE public.user_roles 
ALTER COLUMN role_type TYPE public.role_type 
USING (
  CASE role_type_old::text
    WHEN 'platform_admin' THEN 'platform_admin'::role_type
    WHEN 'enterprise_admin' THEN 'enterprise_admin'::role_type
    WHEN 'organization_admin' THEN 'team_leader'::role_type
    WHEN 'supervisor' THEN 'team_leader'::role_type
    WHEN 'member' THEN 'responder'::role_type
    WHEN 'observer' THEN 'observer'::role_type
    ELSE 'responder'::role_type
  END
);

-- Drop the old enum
DROP TYPE role_type_old;

-- Update the user_has_role function to work with new roles
CREATE OR REPLACE FUNCTION public.user_has_role(_role_type role_type)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.users u ON ur.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
    AND ur.role_type = _role_type
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$$;