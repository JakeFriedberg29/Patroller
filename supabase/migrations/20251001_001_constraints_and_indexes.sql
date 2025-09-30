-- Enterprises: slug unique
create unique index if not exists enterprises_slug_unique on public.enterprises (slug);

-- Organizations: slug unique per-tenant, or global when tenant_id is null
create unique index if not exists organizations_slug_unique_global
  on public.organizations (slug) where tenant_id is null;
create unique index if not exists organizations_slug_unique_tenant
  on public.organizations (tenant_id, slug) where tenant_id is not null;

-- Platform admin assignments: prevent duplicates
create unique index if not exists paa_unique
  on public.platform_admin_account_assignments (platform_admin_id, account_id, account_type);


