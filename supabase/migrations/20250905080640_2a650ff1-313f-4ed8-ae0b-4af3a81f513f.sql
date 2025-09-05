-- Enable RLS on the user_roles_with_details view and add appropriate policies
ALTER VIEW public.user_roles_with_details SET (security_invoker = true);

-- Create RLS policies for the view to match the original user_roles table policies
CREATE POLICY "Platform admins can view all roles with details" 
ON public.user_roles_with_details 
FOR SELECT 
USING (is_platform_admin());

CREATE POLICY "Enterprise admins can view roles in their tenant with details" 
ON public.user_roles_with_details 
FOR SELECT 
USING (
  user_has_role('enterprise_admin'::role_type) 
  AND user_id IN (
    SELECT users.id FROM users 
    WHERE users.tenant_id = get_current_user_tenant_id()
  )
);

CREATE POLICY "Organization admins can view roles in their organization with details" 
ON public.user_roles_with_details 
FOR SELECT 
USING (
  user_has_role('organization_admin'::role_type) 
  AND user_id IN (
    SELECT users.id FROM users 
    WHERE users.organization_id = get_current_user_organization_id()
  )
);

CREATE POLICY "Users can view own roles with details" 
ON public.user_roles_with_details 
FOR SELECT 
USING (
  user_id IN (
    SELECT users.id FROM users 
    WHERE users.auth_user_id = auth.uid()
  )
);