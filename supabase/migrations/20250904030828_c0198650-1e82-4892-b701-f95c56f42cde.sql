-- =====================================================
-- FIX SECURITY: ENABLE RLS ON audit_logs_current
-- =====================================================

-- Enable RLS on the partition table
ALTER TABLE public.audit_logs_current ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for audit_logs_current (same as parent table)
CREATE POLICY "Platform admins can view current audit logs" 
ON public.audit_logs_current 
FOR SELECT 
TO authenticated 
USING (is_platform_admin());

CREATE POLICY "Enterprise admins can view tenant current audit logs" 
ON public.audit_logs_current 
FOR SELECT 
TO authenticated 
USING ((tenant_id = get_current_user_tenant_id()) AND user_has_role('enterprise_admin'::role_type));

CREATE POLICY "System can insert current audit logs" 
ON public.audit_logs_current 
FOR INSERT 
WITH CHECK (true);