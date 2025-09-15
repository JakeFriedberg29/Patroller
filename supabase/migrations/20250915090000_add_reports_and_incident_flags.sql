-- Add reports table and incident flags for legal activity and hospitalization

-- 1) Create reports table
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tenant_id uuid not null references public.enterprises(id) on delete cascade,
  incident_id uuid null references public.incidents(id) on delete set null,
  report_type text not null,
  submitted_at timestamptz not null default now(),
  created_by uuid null references public.users(id) on delete set null,
  metadata jsonb null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Updated at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_reports_set_updated_at on public.reports;
create trigger trg_reports_set_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

-- Indexes
create index if not exists idx_reports_org on public.reports(organization_id);
create index if not exists idx_reports_tenant on public.reports(tenant_id);
create index if not exists idx_reports_submitted_at on public.reports(submitted_at);
create index if not exists idx_reports_type on public.reports(report_type);

-- RLS: ensure tenant isolation
alter table public.reports enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'reports' and policyname = 'reports_select_same_tenant'
  ) then
    create policy reports_select_same_tenant on public.reports
      for select using (tenant_id = public.get_current_user_tenant_id());
  end if;
end $$;

-- 2) Add incident flags
alter table public.incidents
  add column if not exists requires_legal boolean not null default false,
  add column if not exists requires_hospitalization boolean not null default false;

-- Partial indexes for fast filtering on flagged incidents
create index if not exists idx_incidents_requires_legal on public.incidents(organization_id, occurred_at)
  where requires_legal is true;

create index if not exists idx_incidents_requires_hospitalization on public.incidents(organization_id, occurred_at)
  where requires_hospitalization is true;


