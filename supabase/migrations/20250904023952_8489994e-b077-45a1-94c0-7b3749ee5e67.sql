-- =====================================================
-- MISSIONLOG RLS POLICIES - PHASE 2  
-- Complete Multi-Tenant Security Implementation
-- =====================================================

-- =====================================================
-- 1. HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Function to get current user's tenant_id
CREATE OR REPLACE FUNCTION public.get_current_user_tenant_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid();
$$;

-- Function to get current user's organization_id
CREATE OR REPLACE FUNCTION public.get_current_user_organization_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.users WHERE auth_user_id = auth.uid();
$$;

-- Function to check if user has role
CREATE OR REPLACE FUNCTION public.user_has_role(_role_type role_type)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
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

-- Function to check if user is platform admin
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.user_has_role('platform_admin');
$$;

-- =====================================================
-- 2. TENANTS TABLE RLS POLICIES
-- =====================================================

-- Platform admins can do everything with tenants
CREATE POLICY "Platform admins can manage all tenants"
  ON public.tenants
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- Enterprise admins can view their own tenant
CREATE POLICY "Enterprise admins can view their tenant"
  ON public.tenants
  FOR SELECT
  TO authenticated
  USING (id = public.get_current_user_tenant_id() AND public.user_has_role('enterprise_admin'));

-- =====================================================
-- 3. ORGANIZATIONS TABLE RLS POLICIES
-- =====================================================

-- Platform admins can manage all organizations
CREATE POLICY "Platform admins can manage all organizations"
  ON public.organizations
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- Users can only see organizations within their tenant
CREATE POLICY "Users can view organizations in their tenant"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id());

-- Enterprise admins can manage organizations in their tenant
CREATE POLICY "Enterprise admins can manage organizations in their tenant"
  ON public.organizations
  FOR ALL
  TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id() AND public.user_has_role('enterprise_admin'))
  WITH CHECK (tenant_id = public.get_current_user_tenant_id() AND public.user_has_role('enterprise_admin'));

-- =====================================================
-- 4. DEPARTMENTS TABLE RLS POLICIES
-- =====================================================

-- Platform admins can manage all departments
CREATE POLICY "Platform admins can manage all departments"
  ON public.departments
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- Users can view departments in their organization
CREATE POLICY "Users can view departments in their organization"
  ON public.departments
  FOR SELECT
  TO authenticated
  USING (
    organization_id = public.get_current_user_organization_id() OR
    organization_id IN (
      SELECT o.id FROM public.organizations o
      WHERE o.tenant_id = public.get_current_user_tenant_id()
      AND public.user_has_role('enterprise_admin')
    )
  );

-- Organization admins can manage departments in their organization
CREATE POLICY "Organization admins can manage departments"
  ON public.departments
  FOR ALL
  TO authenticated
  USING (
    organization_id = public.get_current_user_organization_id() 
    AND public.user_has_role('organization_admin')
  )
  WITH CHECK (
    organization_id = public.get_current_user_organization_id() 
    AND public.user_has_role('organization_admin')
  );

-- =====================================================
-- 5. LOCATIONS TABLE RLS POLICIES
-- =====================================================

-- Platform admins can manage all locations
CREATE POLICY "Platform admins can manage all locations"
  ON public.locations
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- Users can view locations in their organization
CREATE POLICY "Users can view locations in their organization"
  ON public.locations
  FOR SELECT
  TO authenticated
  USING (
    organization_id = public.get_current_user_organization_id() OR
    organization_id IN (
      SELECT o.id FROM public.organizations o
      WHERE o.tenant_id = public.get_current_user_tenant_id()
      AND public.user_has_role('enterprise_admin')
    )
  );

-- Organization admins can manage locations in their organization
CREATE POLICY "Organization admins can manage locations"
  ON public.locations
  FOR ALL
  TO authenticated
  USING (
    organization_id = public.get_current_user_organization_id() 
    AND public.user_has_role('organization_admin')
  )
  WITH CHECK (
    organization_id = public.get_current_user_organization_id() 
    AND public.user_has_role('organization_admin')
  );

-- =====================================================
-- 6. USERS TABLE RLS POLICIES
-- =====================================================

-- Platform admins can manage all users
CREATE POLICY "Platform admins can manage all users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Enterprise admins can manage users in their tenant
CREATE POLICY "Enterprise admins can manage users in their tenant"
  ON public.users
  FOR ALL
  TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id() AND public.user_has_role('enterprise_admin'))
  WITH CHECK (tenant_id = public.get_current_user_tenant_id() AND public.user_has_role('enterprise_admin'));

-- Organization admins can manage users in their organization
CREATE POLICY "Organization admins can manage users in their organization"
  ON public.users
  FOR ALL
  TO authenticated
  USING (
    organization_id = public.get_current_user_organization_id() 
    AND public.user_has_role('organization_admin')
  )
  WITH CHECK (
    organization_id = public.get_current_user_organization_id() 
    AND public.user_has_role('organization_admin')
  );

-- Users can view other users in their organization
CREATE POLICY "Users can view users in their organization"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (organization_id = public.get_current_user_organization_id());

-- =====================================================
-- 7. USER_ROLES TABLE RLS POLICIES
-- =====================================================

-- Platform admins can manage all roles
CREATE POLICY "Platform admins can manage all roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Enterprise admins can manage roles for users in their tenant
CREATE POLICY "Enterprise admins can manage roles in their tenant"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    public.user_has_role('enterprise_admin') AND
    user_id IN (
      SELECT id FROM public.users 
      WHERE tenant_id = public.get_current_user_tenant_id()
    )
  )
  WITH CHECK (
    public.user_has_role('enterprise_admin') AND
    user_id IN (
      SELECT id FROM public.users 
      WHERE tenant_id = public.get_current_user_tenant_id()
    )
  );

-- Organization admins can manage roles for users in their organization
CREATE POLICY "Organization admins can manage roles in their organization"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    public.user_has_role('organization_admin') AND
    user_id IN (
      SELECT id FROM public.users 
      WHERE organization_id = public.get_current_user_organization_id()
    )
  )
  WITH CHECK (
    public.user_has_role('organization_admin') AND
    user_id IN (
      SELECT id FROM public.users 
      WHERE organization_id = public.get_current_user_organization_id()
    )
  );

-- =====================================================
-- 8. USER_SESSIONS TABLE RLS POLICIES
-- =====================================================

-- Users can only view their own sessions
CREATE POLICY "Users can view own sessions"
  ON public.user_sessions
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Users can create their own sessions
CREATE POLICY "Users can create own sessions"
  ON public.user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Platform admins can view all sessions
CREATE POLICY "Platform admins can view all sessions"
  ON public.user_sessions
  FOR SELECT
  TO authenticated
  USING (public.is_platform_admin());

-- =====================================================
-- 9. AUDIT_LOGS TABLE RLS POLICIES
-- =====================================================

-- Platform admins can view all audit logs
CREATE POLICY "Platform admins can view all audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_platform_admin());

-- Enterprise admins can view audit logs for their tenant
CREATE POLICY "Enterprise admins can view tenant audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id() AND public.user_has_role('enterprise_admin'));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- 10. SECURITY_EVENTS TABLE RLS POLICIES
-- =====================================================

-- Platform admins can manage all security events
CREATE POLICY "Platform admins can manage all security events"
  ON public.security_events
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- Enterprise admins can view security events for their tenant
CREATE POLICY "Enterprise admins can view tenant security events"
  ON public.security_events
  FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id() AND public.user_has_role('enterprise_admin'));

-- System can insert security events
CREATE POLICY "System can insert security events"
  ON public.security_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- 11. EQUIPMENT TABLE RLS POLICIES
-- =====================================================

-- Platform admins can manage all equipment
CREATE POLICY "Platform admins can manage all equipment"
  ON public.equipment
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- Users can view equipment in their organization
CREATE POLICY "Users can view organization equipment"
  ON public.equipment
  FOR SELECT
  TO authenticated
  USING (
    organization_id = public.get_current_user_organization_id() OR
    organization_id IN (
      SELECT o.id FROM public.organizations o
      WHERE o.tenant_id = public.get_current_user_tenant_id()
      AND public.user_has_role('enterprise_admin')
    )
  );

-- Organization admins and supervisors can manage equipment
CREATE POLICY "Organization admins can manage equipment"
  ON public.equipment
  FOR ALL
  TO authenticated
  USING (
    organization_id = public.get_current_user_organization_id() 
    AND (public.user_has_role('organization_admin') OR public.user_has_role('supervisor'))
  )
  WITH CHECK (
    organization_id = public.get_current_user_organization_id() 
    AND (public.user_has_role('organization_admin') OR public.user_has_role('supervisor'))
  );

-- =====================================================
-- 12. INCIDENTS TABLE RLS POLICIES
-- =====================================================

-- Platform admins can view all incidents
CREATE POLICY "Platform admins can view all incidents"
  ON public.incidents
  FOR SELECT
  TO authenticated
  USING (public.is_platform_admin());

-- Users can view incidents in their organization
CREATE POLICY "Users can view organization incidents"
  ON public.incidents
  FOR SELECT
  TO authenticated
  USING (
    organization_id = public.get_current_user_organization_id() OR
    organization_id IN (
      SELECT o.id FROM public.organizations o
      WHERE o.tenant_id = public.get_current_user_tenant_id()
      AND public.user_has_role('enterprise_admin')
    )
  );

-- Users can create incidents in their organization
CREATE POLICY "Users can create incidents"
  ON public.incidents
  FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = public.get_current_user_organization_id());

-- Organization admins and supervisors can manage incidents
CREATE POLICY "Organization admins can manage incidents"
  ON public.incidents
  FOR UPDATE
  TO authenticated
  USING (
    organization_id = public.get_current_user_organization_id() 
    AND (public.user_has_role('organization_admin') OR public.user_has_role('supervisor'))
  )
  WITH CHECK (
    organization_id = public.get_current_user_organization_id() 
    AND (public.user_has_role('organization_admin') OR public.user_has_role('supervisor'))
  );

-- =====================================================
-- 13. REPORT_TEMPLATES TABLE RLS POLICIES
-- =====================================================

-- Platform admins can manage all report templates
CREATE POLICY "Platform admins can manage all report templates"
  ON public.report_templates
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- Users can view report templates in their organization
CREATE POLICY "Users can view organization report templates"
  ON public.report_templates
  FOR SELECT
  TO authenticated
  USING (
    organization_id = public.get_current_user_organization_id() OR
    organization_id IN (
      SELECT o.id FROM public.organizations o
      WHERE o.tenant_id = public.get_current_user_tenant_id()
      AND public.user_has_role('enterprise_admin')
    )
  );

-- Organization admins can manage report templates
CREATE POLICY "Organization admins can manage report templates"
  ON public.report_templates
  FOR ALL
  TO authenticated
  USING (
    organization_id = public.get_current_user_organization_id() 
    AND public.user_has_role('organization_admin')
  )
  WITH CHECK (
    organization_id = public.get_current_user_organization_id() 
    AND public.user_has_role('organization_admin')
  );

-- =====================================================
-- 14. NOTIFICATIONS TABLE RLS POLICIES
-- =====================================================

-- Platform admins can manage all notifications
CREATE POLICY "Platform admins can manage all notifications"
  ON public.notifications
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Enterprise admins can create notifications for users in their tenant
CREATE POLICY "Enterprise admins can create notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.user_has_role('enterprise_admin') AND
    tenant_id = public.get_current_user_tenant_id() AND
    user_id IN (
      SELECT id FROM public.users 
      WHERE tenant_id = public.get_current_user_tenant_id()
    )
  );