-- Step 1: Add new role types and permission field
ALTER TYPE role_type ADD VALUE IF NOT EXISTS 'enterprise_user';
ALTER TYPE role_type ADD VALUE IF NOT EXISTS 'organization_user';

-- Step 2: Add permission column to user_roles
ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS permission text CHECK (permission IN ('full', 'view')) DEFAULT 'full';

-- Step 3: Migrate existing enterprise_admin to enterprise_user
UPDATE public.user_roles
SET role_type = 'enterprise_user'::role_type,
    permission = 'full'
WHERE role_type = 'enterprise_admin'::role_type;

-- Step 4: Migrate existing organization_admin to organization_user  
UPDATE public.user_roles
SET role_type = 'organization_user'::role_type,
    permission = 'full'
WHERE role_type = 'organization_admin'::role_type;

-- Step 5: Update all security definer functions to use new role types
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

-- Step 6: Add helper function to check if user has full permission
CREATE OR REPLACE FUNCTION public.user_has_full_permission(_role_type role_type)
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
    AND ur.permission = 'full'
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$$;

-- Step 7: Update RLS policies to use new role types
-- Enterprise users can manage users in their tenant
DROP POLICY IF EXISTS "Enterprise users can manage users in their tenant" ON public.users;
CREATE POLICY "Enterprise users can manage users in their tenant"
ON public.users
FOR ALL
USING (
  (tenant_id = get_current_user_tenant_id()) 
  AND user_has_full_permission('enterprise_user'::role_type)
)
WITH CHECK (
  (tenant_id = get_current_user_tenant_id()) 
  AND user_has_full_permission('enterprise_user'::role_type)
);

-- Enterprise users can manage roles in their tenant
DROP POLICY IF EXISTS "Enterprise users can manage roles in their tenant" ON public.user_roles;
CREATE POLICY "Enterprise users can manage roles in their tenant"
ON public.user_roles
FOR ALL
USING (
  user_has_full_permission('enterprise_user'::role_type) 
  AND (user_id IN (
    SELECT users.id FROM users WHERE users.tenant_id = get_current_user_tenant_id()
  ))
)
WITH CHECK (
  user_has_full_permission('enterprise_user'::role_type) 
  AND (user_id IN (
    SELECT users.id FROM users WHERE users.tenant_id = get_current_user_tenant_id()
  ))
);

-- Organization users can manage users in their organization
DROP POLICY IF EXISTS "Organization users can manage users in their organization" ON public.users;
CREATE POLICY "Organization users can manage users in their organization"
ON public.users
FOR ALL
USING (
  (organization_id = get_current_user_organization_id()) 
  AND user_has_full_permission('organization_user'::role_type)
)
WITH CHECK (
  (organization_id = get_current_user_organization_id()) 
  AND user_has_full_permission('organization_user'::role_type)
);

-- Organization users can manage roles in their organization
DROP POLICY IF EXISTS "Organization users can manage roles in their organization" ON public.user_roles;
CREATE POLICY "Organization users can manage roles in their organization"
ON public.user_roles
FOR ALL
USING (
  user_has_full_permission('organization_user'::role_type)
  AND (user_id IN (
    SELECT users.id FROM users WHERE users.organization_id = get_current_user_organization_id()
  ))
)
WITH CHECK (
  user_has_full_permission('organization_user'::role_type)
  AND (user_id IN (
    SELECT users.id FROM users WHERE users.organization_id = get_current_user_organization_id()
  ))
);

-- Step 8: Update organizations management policy
DROP POLICY IF EXISTS "Enterprise users can manage organizations in their tenant" ON public.organizations;
CREATE POLICY "Enterprise users can manage organizations in their tenant"
ON public.organizations
FOR ALL
USING (
  (tenant_id = get_current_user_tenant_id()) 
  AND user_has_role('enterprise_user'::role_type)
)
WITH CHECK (
  (tenant_id = get_current_user_tenant_id()) 
  AND user_has_role('enterprise_user'::role_type)
);

-- Step 9: Add comment explaining the permission system
COMMENT ON COLUMN public.user_roles.permission IS 'Permission level: full = can manage and edit, view = read-only access';