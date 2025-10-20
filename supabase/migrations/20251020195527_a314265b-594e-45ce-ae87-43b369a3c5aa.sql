-- Phase 1: Add RLS policies to unprotected tables (simplified)

-- Enable RLS on email_notification_logs (contains PII - email addresses)
ALTER TABLE public.email_notification_logs ENABLE ROW LEVEL SECURITY;

-- Platform admins can view all email logs
CREATE POLICY "Platform admins can view all email logs"
ON public.email_notification_logs
FOR SELECT
TO authenticated
USING (public.is_platform_admin());

-- System can insert email logs
CREATE POLICY "System can insert email logs"
ON public.email_notification_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Enable RLS on email_notification_templates
ALTER TABLE public.email_notification_templates ENABLE ROW LEVEL SECURITY;

-- Platform admins can manage all email templates
CREATE POLICY "Platform admins can manage email templates"
ON public.email_notification_templates
FOR ALL
TO authenticated
USING (public.is_platform_admin())
WITH CHECK (public.is_platform_admin());

-- Tenant users can view their tenant's email templates
CREATE POLICY "Tenant users can view email templates"
ON public.email_notification_templates
FOR SELECT
TO authenticated
USING (tenant_id = public.get_current_user_tenant_id());

-- Enable RLS on patroller_report_visibility
ALTER TABLE public.patroller_report_visibility ENABLE ROW LEVEL SECURITY;

-- Platform admins can manage all visibility settings
CREATE POLICY "Platform admins can manage visibility"
ON public.patroller_report_visibility
FOR ALL
TO authenticated
USING (public.is_platform_admin())
WITH CHECK (public.is_platform_admin());

-- Organization users can view visibility for their org
CREATE POLICY "Org users can view visibility"
ON public.patroller_report_visibility
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.users 
    WHERE auth_user_id = auth.uid()
  )
);

-- Tenant users can manage visibility for their tenant
CREATE POLICY "Tenant users can manage visibility"
ON public.patroller_report_visibility
FOR ALL
TO authenticated
USING (
  tenant_id = public.get_current_user_tenant_id()
  AND (public.user_has_tenant_write() OR public.is_platform_admin())
)
WITH CHECK (
  tenant_id = public.get_current_user_tenant_id()
  AND (public.user_has_tenant_write() OR public.is_platform_admin())
);

-- Fix database functions missing search_path for security
CREATE OR REPLACE FUNCTION public.get_current_user_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT organization_id FROM public.users WHERE auth_user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.user_get_current_org()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT organization_id FROM public.users WHERE auth_user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.platform_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.users u ON ur.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
      AND ur.role_type = 'platform_admin'::public.role_type
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$$;