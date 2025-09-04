-- Drop existing audit log policies that are too permissive
DROP POLICY IF EXISTS "Enterprise admins can view tenant audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Enterprise admins can view tenant current audit logs" ON public.audit_logs_current;

-- Create more restrictive policies for audit_logs
-- Only platform admins can view all audit logs
CREATE POLICY "Platform admins only can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (is_platform_admin());

-- Organization admins can only view audit logs for their specific organization
CREATE POLICY "Organization admins can view organization audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  user_has_role('organization_admin'::role_type) 
  AND resource_type IN ('user', 'equipment', 'incident', 'report', 'location')
  AND EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = audit_logs.user_id 
    AND u.organization_id = get_current_user_organization_id()
  )
);

-- Create more restrictive policies for audit_logs_current
CREATE POLICY "Platform admins only can view current audit logs" 
ON public.audit_logs_current 
FOR SELECT 
USING (is_platform_admin());

-- Organization admins can only view current audit logs for their specific organization
CREATE POLICY "Organization admins can view organization current audit logs" 
ON public.audit_logs_current 
FOR SELECT 
USING (
  user_has_role('organization_admin'::role_type) 
  AND resource_type IN ('user', 'equipment', 'incident', 'report', 'location')
  AND EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = audit_logs_current.user_id 
    AND u.organization_id = get_current_user_organization_id()
  )
);