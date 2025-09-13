-- Create tenants view over enterprises if not present
DO $$
DECLARE
  v_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='tenants'
  ) OR EXISTS (
    SELECT 1 FROM information_schema.views WHERE table_schema='public' AND table_name='tenants'
  ) INTO v_exists;

  IF NOT v_exists THEN
    EXECUTE 'CREATE VIEW public.tenants AS
      SELECT 
        e.id,
        e.name,
        e.slug,
        e.subscription_tier,
        e.subscription_status,
        e.subscription_expires_at,
        e.max_organizations,
        e.max_users,
        e.settings,
        e.created_at,
        e.updated_at
      FROM public.enterprises e';
  END IF;
END $$;

-- Ensure RLS enabled and policy exists on enterprises
ALTER TABLE IF EXISTS public.enterprises ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE v_policy_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='enterprises' AND policyname='Platform admins can manage all enterprises'
  ) INTO v_policy_exists;

  IF NOT v_policy_exists THEN
    EXECUTE 'CREATE POLICY "Platform admins can manage all enterprises" ON public.enterprises FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin())';
  END IF;
END $$;


