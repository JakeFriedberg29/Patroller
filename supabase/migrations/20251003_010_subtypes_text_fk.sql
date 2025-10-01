-- Convert organization_subtypes.name from enum to TEXT, update subtype RPCs,
-- backfill repository_assignments to use target_organization_subtype_id, and
-- replace unique indexes to use subtype id.

begin;

-- 1) Convert name column to TEXT
alter table public.organization_subtypes
  alter column name type text using name::text;

-- 2) Ensure unique per-tenant subtype names
create unique index if not exists ux_organization_subtypes_tenant_name
  on public.organization_subtypes(tenant_id, name);

-- 3) Replace RPCs to remove enum coupling and operate purely on TEXT
drop function if exists public.add_organization_subtype(p_name text);
create or replace function public.add_organization_subtype(p_name text)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.organization_subtypes(tenant_id, name)
  values (get_current_user_tenant_id(), p_name)
  on conflict (tenant_id, name) do nothing;
end;
$$;

drop function if exists public.rename_organization_subtype(p_old_name text, p_new_name text);
create or replace function public.rename_organization_subtype(p_old_name text, p_new_name text)
returns void
language plpgsql
security definer
as $$
begin
  -- If the new name already exists, just remove the old row
  if exists (
    select 1 from public.organization_subtypes
    where tenant_id = get_current_user_tenant_id() and name = p_new_name
  ) then
    delete from public.organization_subtypes
    where tenant_id = get_current_user_tenant_id() and name = p_old_name;
  else
    update public.organization_subtypes
    set name = p_new_name, updated_at = now()
    where tenant_id = get_current_user_tenant_id() and name = p_old_name;
  end if;
end;
$$;

drop function if exists public.delete_organization_subtype(p_name text);
create or replace function public.delete_organization_subtype(p_name text)
returns void
language plpgsql
security definer
as $$
declare
  v_tenant uuid := get_current_user_tenant_id();
  v_subtype_id uuid;
begin
  select id into v_subtype_id
  from public.organization_subtypes
  where tenant_id = v_tenant and name = p_name;

  if v_subtype_id is not null then
    -- Remove repository assignments that target this subtype id
    delete from public.repository_assignments ra
    where ra.tenant_id = v_tenant
      and ra.target_type = 'organization_type'
      and ra.target_organization_subtype_id = v_subtype_id;
  end if;

  delete from public.organization_subtypes
  where tenant_id = v_tenant and name = p_name;
end;
$$;

-- 4) Backfill repository_assignments.target_organization_subtype_id from legacy enum/name
-- 4a) Ensure subtype rows exist for any legacy enum names referenced
insert into public.organization_subtypes(tenant_id, name)
select distinct ra.tenant_id, ra.target_organization_type::text
from public.repository_assignments ra
where ra.target_type = 'organization_type'
  and ra.target_organization_type is not null
  and not exists (
    select 1 from public.organization_subtypes s
    where s.tenant_id = ra.tenant_id and s.name = ra.target_organization_type::text
  );

-- 4b) Backfill subtype id now that rows are guaranteed to exist
update public.repository_assignments ra
set target_organization_subtype_id = s.id
from public.organization_subtypes s
where ra.target_type = 'organization_type'
  and ra.target_organization_subtype_id is null
  and s.tenant_id = ra.tenant_id
  and s.name = ra.target_organization_type::text;

-- 4c) Normalize mismatched columns based on target_type
update public.repository_assignments
set target_organization_id = null
where target_type = 'organization_type' and target_organization_id is not null;

update public.repository_assignments
set target_organization_subtype_id = null
where target_type = 'organization' and target_organization_subtype_id is not null;

-- 4d) Remove irreparably invalid rows (missing required target values)
delete from public.repository_assignments
where (target_type = 'organization_type' and target_organization_subtype_id is null)
   or (target_type = 'organization' and target_organization_id is null);

-- 5) Replace unique index: move off enum column to subtype id, and ensure org-level uniqueness
drop index if exists public.ux_repository_assignments;

create unique index if not exists ux_repository_assignments_subtype
on public.repository_assignments(tenant_id, element_type, element_id, target_type, target_organization_subtype_id)
where target_type = 'organization_type';

create unique index if not exists ux_repository_assignments_org
on public.repository_assignments(tenant_id, element_type, element_id, target_type, target_organization_id)
where target_type = 'organization';

-- 6) Add check constraint to enforce target column presence by type
alter table public.repository_assignments
  drop constraint if exists chk_repository_assignments_target_nonnull;

alter table public.repository_assignments
  add constraint chk_repository_assignments_target_nonnull
  check (
    (target_type = 'organization' and target_organization_id is not null and target_organization_subtype_id is null)
    or
    (target_type = 'organization_type' and target_organization_subtype_id is not null and target_organization_id is null)
  );

commit;


