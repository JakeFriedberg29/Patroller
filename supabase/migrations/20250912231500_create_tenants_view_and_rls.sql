-- Create compatibility view `public.tenants` over `public.enterprises` if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='tenants'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema='public' AND table_name='tenants'
  ) THEN
    EXECUTE $$
      CREATE VIEW public.tenants AS
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
      FROM public.enterprises e
    $$;
  END IF;
END $$;

-- Ensure RLS enabled on underlying tables/views where needed (views inherit underlying RLS)
ALTER TABLE IF EXISTS public.enterprises ENABLE ROW LEVEL SECURITY;

-- Helper functions assumed to exist; grant policies consistent with tenants usage
-- Platform admins: full access to enterprises
DO $$
BEGIN
  -- SELECT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='enterprises' AND policyname='Platform admins can manage all enterprises'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Platform admins can manage all enterprises"
      ON public.enterprises
      FOR ALL
      TO authenticated
      USING (public.is_platform_admin())
      WITH CHECK (public.is_platform_admin());
    $$;
  END IF;
END $$;


