-- Drop and recreate the view with security invoker (safer approach)
DROP VIEW IF EXISTS public.user_roles_with_details;

CREATE VIEW public.user_roles_with_details 
WITH (security_invoker = true) AS
SELECT 
  ur.id,
  ur.user_id,
  u.email,
  u.full_name,
  ur.role_type,
  ur.organization_id,
  o.name as organization_name,
  ur.granted_by,
  ur.granted_at,
  ur.expires_at,
  ur.is_active
FROM public.user_roles ur
JOIN public.users u ON ur.user_id = u.id
LEFT JOIN public.organizations o ON ur.organization_id = o.id
ORDER BY ur.granted_at DESC;