-- Subtypes tables and RPCs
-- 1) Tables
CREATE TABLE IF NOT EXISTS public.enterprise_subtypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.enterprises(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);

CREATE TABLE IF NOT EXISTS public.organization_subtypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.enterprises(id) ON DELETE CASCADE,
  name public.organization_type NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_enterprise_subtypes_tenant ON public.enterprise_subtypes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_organization_subtypes_tenant ON public.organization_subtypes(tenant_id);

-- RLS
ALTER TABLE public.enterprise_subtypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_subtypes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Platform admins can manage enterprise subtypes" ON public.enterprise_subtypes;
CREATE POLICY "Platform admins can manage enterprise subtypes"
ON public.enterprise_subtypes
FOR ALL
TO authenticated
USING (is_platform_admin())
WITH CHECK (is_platform_admin());

DROP POLICY IF EXISTS "Tenant users can view enterprise subtypes" ON public.enterprise_subtypes;
CREATE POLICY "Tenant users can view enterprise subtypes"
ON public.enterprise_subtypes
FOR SELECT
TO authenticated
USING (tenant_id = get_current_user_tenant_id());

DROP POLICY IF EXISTS "Platform admins can manage organization subtypes" ON public.organization_subtypes;
CREATE POLICY "Platform admins can manage organization subtypes"
ON public.organization_subtypes
FOR ALL
TO authenticated
USING (is_platform_admin())
WITH CHECK (is_platform_admin());

DROP POLICY IF EXISTS "Tenant users can view organization subtypes" ON public.organization_subtypes;
CREATE POLICY "Tenant users can view organization subtypes"
ON public.organization_subtypes
FOR SELECT
TO authenticated
USING (tenant_id = get_current_user_tenant_id());

-- 2) RPCs for organization_type enum management
-- Add organization subtype: adds enum value if needed, then inserts into table
CREATE OR REPLACE FUNCTION public.add_organization_subtype(p_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_platform_admin() THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;

  -- Add enum value if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'organization_type' AND e.enumlabel = p_name
  ) THEN
    EXECUTE 'ALTER TYPE public.organization_type ADD VALUE ' || quote_literal(p_name);
  END IF;

  -- Insert into table if missing
  INSERT INTO public.organization_subtypes(tenant_id, name)
  VALUES (get_current_user_tenant_id(), p_name::public.organization_type)
  ON CONFLICT (tenant_id, name) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.add_organization_subtype(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_organization_subtype(TEXT) TO authenticated;

-- Rename organization subtype: renames enum value and updates table
CREATE OR REPLACE FUNCTION public.rename_organization_subtype(p_old_name TEXT, p_new_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_platform_admin() THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;

  -- Ensure new value exists or add it by renaming directly
  EXECUTE 'ALTER TYPE public.organization_type RENAME VALUE ' || quote_literal(p_old_name) || ' TO ' || quote_literal(p_new_name);

  -- Update catalog row for current tenant
  UPDATE public.organization_subtypes
  SET name = p_new_name::public.organization_type, updated_at = now()
  WHERE tenant_id = get_current_user_tenant_id() AND name = p_old_name::public.organization_type;
END;
$$;

REVOKE ALL ON FUNCTION public.rename_organization_subtype(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rename_organization_subtype(TEXT, TEXT) TO authenticated;

-- Delete organization subtype: removes from catalog and clears platform assignments referencing it
CREATE OR REPLACE FUNCTION public.delete_organization_subtype(p_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_platform_admin() THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;

  -- Remove from catalog for current tenant
  DELETE FROM public.organization_subtypes
  WHERE tenant_id = get_current_user_tenant_id() AND name = p_name::public.organization_type;

  -- Remove any platform assignments referencing this subtype across all tenants
  DELETE FROM public.platform_assignments
  WHERE target_type = 'organization_type'::public.platform_assignment_target_type
    AND target_organization_type = p_name::public.organization_type;

  -- Note: The enum value remains; dropping enum values is not supported. Existing organizations keep the old value.
END;
$$;

REVOKE ALL ON FUNCTION public.delete_organization_subtype(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_organization_subtype(TEXT) TO authenticated;

-- 3) Seed initial values for platform tenant (Patroller Console)
DO $$
DECLARE
  platform_tenant_id UUID;
BEGIN
  SELECT id INTO platform_tenant_id FROM public.enterprises WHERE slug = 'patroller-console' OR name = 'Patroller Console' LIMIT 1;

  IF platform_tenant_id IS NOT NULL THEN
    -- Enterprise subtypes
    INSERT INTO public.enterprise_subtypes(tenant_id, name) VALUES
      (platform_tenant_id, 'Resort Chain'),
      (platform_tenant_id, 'Municipality'),
      (platform_tenant_id, 'Park Agency'),
      (platform_tenant_id, 'Event Management')
    ON CONFLICT (tenant_id, name) DO NOTHING;

    -- Organization subtypes (ensure corresponding enum values already exist)
    INSERT INTO public.organization_subtypes(tenant_id, name) VALUES
      (platform_tenant_id, 'search_and_rescue'),
      (platform_tenant_id, 'lifeguard_service'),
      (platform_tenant_id, 'park_service'),
      (platform_tenant_id, 'event_medical'),
      (platform_tenant_id, 'ski_patrol'),
      (platform_tenant_id, 'harbor_master'),
      (platform_tenant_id, 'volunteer_emergency_services')
    ON CONFLICT (tenant_id, name) DO NOTHING;
  END IF;
END $$;


