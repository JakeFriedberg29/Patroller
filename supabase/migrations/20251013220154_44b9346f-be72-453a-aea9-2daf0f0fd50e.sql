-- Phase 1: Migrate existing user_roles to consolidated roles
-- Create temporary column to store role as text
ALTER TABLE public.user_roles ADD COLUMN role_type_temp text;

-- Copy current roles as text, mapping deprecated roles to new ones
UPDATE public.user_roles
SET role_type_temp = CASE 
  WHEN role_type::text = 'enterprise_admin' THEN 'enterprise_user'
  WHEN role_type::text = 'organization_admin' THEN 'organization_user'
  WHEN role_type::text = 'member' THEN 'patroller'
  WHEN role_type::text = 'responder' THEN 'patroller'
  ELSE role_type::text
END;

-- Phase 2: Create new consolidated enum
CREATE TYPE role_type_new AS ENUM (
  'platform_admin',
  'enterprise_user',
  'organization_user',
  'patroller'
);

-- Phase 3: Drop old column and recreate with new enum
ALTER TABLE public.user_roles DROP COLUMN role_type;
ALTER TABLE public.user_roles ADD COLUMN role_type role_type_new NOT NULL DEFAULT 'patroller'::role_type_new;

-- Copy data from temp column to new role_type column
UPDATE public.user_roles
SET role_type = role_type_temp::role_type_new;

-- Remove temp column
ALTER TABLE public.user_roles DROP COLUMN role_type_temp;

-- Phase 4: Clean up old enum type
DROP TYPE IF EXISTS role_type CASCADE;

-- Rename new enum to role_type
ALTER TYPE role_type_new RENAME TO role_type;

-- Phase 5: Add audit log for role consolidation
DO $$
DECLARE
  v_tenant_id uuid;
BEGIN
  SELECT tenant_id INTO v_tenant_id FROM public.users LIMIT 1;
  
  IF v_tenant_id IS NOT NULL THEN
    INSERT INTO public.audit_logs (
      tenant_id,
      user_id,
      action,
      resource_type,
      resource_id,
      metadata,
      created_at
    ) VALUES (
      v_tenant_id,
      NULL,
      'ROLE_CONSOLIDATION',
      'system',
      gen_random_uuid(),
      jsonb_build_object(
        'message', 'Consolidated user roles: enterprise_admin→enterprise_user, organization_admin→organization_user, member→patroller, responder→patroller',
        'removed_roles', ARRAY['supervisor', 'observer', 'team_leader'],
        'active_roles', ARRAY['platform_admin', 'enterprise_user', 'organization_user', 'patroller'],
        'migration_date', now()
      ),
      now()
    );
  END IF;
END $$;

COMMENT ON TYPE role_type IS 'Consolidated user roles: platform_admin (system admin), enterprise_user (enterprise-level admin), organization_user (org-level admin), patroller (field responders)';