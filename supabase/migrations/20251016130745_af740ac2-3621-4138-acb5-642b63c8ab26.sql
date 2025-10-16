-- Add performance indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON public.users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON public.organizations(tenant_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status) WHERE status = 'active';

-- Add performance indexes for user_roles table
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_org_id ON public.user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON public.user_roles(user_id, role_type) WHERE is_active = true;

-- Add performance indexes for audit_logs table (covers partitioned tables too)
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created ON public.audit_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- Add performance indexes for organizations table
CREATE INDEX IF NOT EXISTS idx_organizations_tenant_active ON public.organizations(tenant_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(tenant_id, slug);

-- Add performance indexes for report_templates table
CREATE INDEX IF NOT EXISTS idx_report_templates_tenant_status ON public.report_templates(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_report_templates_org ON public.report_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_created_by ON public.report_templates(created_by);

-- Add performance indexes for reports_submissions table
CREATE INDEX IF NOT EXISTS idx_reports_submissions_tenant ON public.reports_submissions(tenant_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_submissions_account ON public.reports_submissions(account_id, account_type);
CREATE INDEX IF NOT EXISTS idx_reports_submissions_template ON public.reports_submissions(template_id);
CREATE INDEX IF NOT EXISTS idx_reports_submissions_creator ON public.reports_submissions(created_by);

-- Add performance indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, created_at DESC) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_user_all ON public.notifications(user_id, created_at DESC);

-- Add performance indexes for platform_admin_account_assignments table
CREATE INDEX IF NOT EXISTS idx_platform_admin_assignments_admin ON public.platform_admin_account_assignments(platform_admin_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_platform_admin_assignments_account ON public.platform_admin_account_assignments(account_id, account_type);

-- Add performance indexes for repository_assignments table
CREATE INDEX IF NOT EXISTS idx_repository_assignments_element ON public.repository_assignments(element_type, element_id);
CREATE INDEX IF NOT EXISTS idx_repository_assignments_target_org ON public.repository_assignments(target_organization_id);
CREATE INDEX IF NOT EXISTS idx_repository_assignments_target_type ON public.repository_assignments(tenant_id, target_type);