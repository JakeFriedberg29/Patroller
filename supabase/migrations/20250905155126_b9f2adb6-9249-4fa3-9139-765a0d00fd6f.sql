-- Add platform admin access to all tables that might be missing it

-- Ensure platform admins can manage users in any organization
DROP POLICY IF EXISTS "Platform admins can manage all users" ON public.users;
CREATE POLICY "Platform admins can manage all users" 
ON public.users 
FOR ALL 
USING (is_platform_admin()) 
WITH CHECK (is_platform_admin());

-- Ensure platform admins can manage user roles in any organization  
DROP POLICY IF EXISTS "Platform admins can manage all roles" ON public.user_roles;
CREATE POLICY "Platform admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (is_platform_admin()) 
WITH CHECK (is_platform_admin());

-- Ensure platform admins can manage all equipment
DROP POLICY IF EXISTS "Platform admins can manage all equipment" ON public.equipment;
CREATE POLICY "Platform admins can manage all equipment" 
ON public.equipment 
FOR ALL 
USING (is_platform_admin()) 
WITH CHECK (is_platform_admin());

-- Ensure platform admins can manage all locations  
DROP POLICY IF EXISTS "Platform admins can manage all locations" ON public.locations;
CREATE POLICY "Platform admins can manage all locations" 
ON public.locations 
FOR ALL 
USING (is_platform_admin()) 
WITH CHECK (is_platform_admin());

-- Ensure platform admins can manage all departments
DROP POLICY IF EXISTS "Platform admins can manage all departments" ON public.departments;
CREATE POLICY "Platform admins can manage all departments" 
ON public.departments 
FOR ALL 
USING (is_platform_admin()) 
WITH CHECK (is_platform_admin());

-- Ensure platform admins can view all incidents (they already have this)
-- Just making sure the policy exists and is correct
DROP POLICY IF EXISTS "Platform admins can view all incidents" ON public.incidents;
CREATE POLICY "Platform admins can view all incidents" 
ON public.incidents 
FOR SELECT 
USING (is_platform_admin());

-- Add platform admin ability to manage incidents
CREATE POLICY "Platform admins can manage all incidents" 
ON public.incidents 
FOR ALL 
USING (is_platform_admin()) 
WITH CHECK (is_platform_admin());

-- Ensure platform admins can manage all report templates
DROP POLICY IF EXISTS "Platform admins can manage all report templates" ON public.report_templates;
CREATE POLICY "Platform admins can manage all report templates" 
ON public.report_templates 
FOR ALL 
USING (is_platform_admin()) 
WITH CHECK (is_platform_admin());