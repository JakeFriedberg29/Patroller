-- Fix audit logs trigger to allow platform admins to create cross-tenant logs
CREATE OR REPLACE FUNCTION public.trg_audit_logs_enforce_tenant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_tenant uuid;
  v_is_platform_admin boolean;
BEGIN
  -- Allow system logs (no user_id)
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Get user's tenant
  SELECT u.tenant_id INTO v_user_tenant 
  FROM public.users u 
  WHERE u.id = NEW.user_id;
  
  -- Check if user is a platform admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = NEW.user_id
      AND ur.role_type = 'platform_admin'
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  ) INTO v_is_platform_admin;
  
  -- Allow platform admins to create audit logs for any tenant
  IF v_is_platform_admin THEN
    RETURN NEW;
  END IF;
  
  -- For non-platform admins, enforce tenant matching
  IF v_user_tenant IS NULL OR NEW.tenant_id IS DISTINCT FROM v_user_tenant THEN
    RAISE EXCEPTION 'Cross-tenant reference not allowed (audit_logs.user_id vs tenant_id)';
  END IF;
  
  RETURN NEW;
END;
$function$;