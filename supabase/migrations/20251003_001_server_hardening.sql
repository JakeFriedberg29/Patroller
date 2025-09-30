-- Server-side hardening: slug generation, idempotency result mapping, permissions, unique indexes

-- Helper slugify function (ASCII-only)
create or replace function public.slugify(p_text text)
returns text language sql immutable as $$
  select trim(both '-' from regexp_replace(lower(coalesce(p_text, '')),'[^a-z0-9]+','-','g'))
$$;

-- Idempotency results mapping to return the same resource id on duplicate request_id
create table if not exists public.idempotency_results (
  request_id uuid primary key,
  resource_type text not null,
  resource_id uuid not null,
  created_at timestamptz not null default now()
);

-- Unique index to prevent duplicate repository assignments
create unique index if not exists ux_repository_assignments
on public.repository_assignments(tenant_id, element_type, element_id, target_type, target_organization_type);

-- Tighten RPCs with permissions and idempotency returns

-- set_platform_admin_assignment: require platform admin
create or replace function public.set_platform_admin_assignment(
  p_admin_id uuid,
  p_account_id uuid,
  p_account_type text,
  p_is_active boolean,
  p_request_id uuid default gen_random_uuid()
) returns void
language plpgsql security definer as $$
begin
  if not public.ensure_current_user_platform_admin() then
    raise exception 'Forbidden: platform admin required';
  end if;

  with upsert as (
    insert into public.platform_admin_account_assignments(platform_admin_id, account_id, account_type, is_active)
    values (p_admin_id, p_account_id, p_account_type, p_is_active)
    on conflict (platform_admin_id, account_id, account_type)
    do update set is_active = excluded.is_active
  )
  select 1;

  insert into public.idempotency_keys(id) values (p_request_id) on conflict do nothing;
end; $$;

-- update_enterprise_settings_tx: require platform admin
create or replace function public.update_enterprise_settings_tx(
  p_tenant_id uuid,
  p_payload jsonb,
  p_request_id uuid default gen_random_uuid()
) returns void
language plpgsql security definer as $$
begin
  if not public.ensure_current_user_platform_admin() then
    raise exception 'Forbidden: platform admin required';
  end if;

  perform 1 from public.idempotency_keys where id = p_request_id; if found then return; end if;

  update public.enterprises
  set
    name = coalesce(p_payload->>'name', name),
    settings = coalesce(p_payload->'settings', settings),
    subscription_status = coalesce(p_payload->>'subscription_status', subscription_status)
  where id = p_tenant_id;

  insert into public.idempotency_keys(id) values (p_request_id) on conflict do nothing;
end; $$;

-- delete_enterprise_tx: require platform admin
create or replace function public.delete_enterprise_tx(
  p_tenant_id uuid,
  p_actor_id uuid,
  p_force boolean default false,
  p_request_id uuid default gen_random_uuid()
) returns void
language plpgsql security definer as $$
declare
  v_org_count int;
begin
  if not public.ensure_current_user_platform_admin() then
    raise exception 'Forbidden: platform admin required';
  end if;

  perform 1 from public.idempotency_keys where id = p_request_id; if found then return; end if;

  select count(*) into v_org_count from public.organizations where tenant_id = p_tenant_id;
  if not p_force and v_org_count > 0 then
    raise exception 'Cannot delete enterprise with existing organizations. Set p_force=true to proceed.';
  end if;

  if p_force then
    delete from public.organizations where tenant_id = p_tenant_id;
  end if;

  delete from public.enterprises where id = p_tenant_id;

  insert into public.audit_logs(tenant_id, user_id, action, resource_type, resource_id, metadata)
  values (p_tenant_id, p_actor_id, 'DELETE_ENTERPRISE', 'enterprise', p_tenant_id, jsonb_build_object('forced', p_force, 'request_id', p_request_id));

  insert into public.idempotency_keys(id) values (p_request_id) on conflict do nothing;
end; $$;

-- create_report_tx: return same id for duplicate request_id
create or replace function public.create_report_tx(
  p_actor_id uuid,
  p_payload jsonb,
  p_request_id uuid default gen_random_uuid()
) returns uuid
language plpgsql security definer as $$
declare
  v_id uuid;
  v_tenant uuid;
  v_account_id uuid;
  v_account_type text;
begin
  select resource_id into v_id from public.idempotency_results where request_id = p_request_id and resource_type = 'report';
  if v_id is not null then
    return v_id;
  end if;

  v_tenant := nullif(p_payload->>'tenant_id','')::uuid;
  v_account_id := nullif(p_payload->>'account_id','')::uuid;
  v_account_type := coalesce(p_payload->>'account_type','organization');

  if v_account_type = 'organization' then
    perform public.assert_record_matches_org_tenant(v_account_id, v_tenant);
  end if;

  insert into public.reports (
    tenant_id,
    account_id,
    account_type,
    template_id,
    template_version,
    title,
    description,
    report_type,
    created_by,
    incident_id,
    metadata,
    submitted_at
  ) values (
    v_tenant,
    v_account_id,
    v_account_type,
    nullif(p_payload->>'template_id','')::uuid,
    nullif(p_payload->>'template_version','')::int,
    nullif(p_payload->>'title',''),
    nullif(p_payload->>'description',''),
    (p_payload->>'report_type'),
    p_actor_id,
    nullif(p_payload->>'incident_id','')::uuid,
    coalesce(p_payload->'metadata', '{}'::jsonb),
    coalesce(nullif(p_payload->>'submitted_at',''), now())::timestamptz
  ) returning id into v_id;

  insert into public.audit_logs(tenant_id, user_id, action, resource_type, resource_id, metadata)
  values (v_tenant, p_actor_id, 'CREATE_REPORT', 'report', v_id, jsonb_build_object('request_id', p_request_id));

  insert into public.idempotency_keys(id) values (p_request_id) on conflict do nothing;
  insert into public.idempotency_results(request_id, resource_type, resource_id) values (p_request_id, 'report', v_id) on conflict do nothing;
  return v_id;
end; $$;

-- create_organization_tx: require platform admin and generate unique slug server-side
create or replace function public.create_organization_tx(
  p_payload jsonb,
  p_request_id uuid default gen_random_uuid()
) returns uuid
language plpgsql security definer as $$
declare
  v_id uuid;
  v_tenant uuid;
  v_base_slug text;
  v_slug text;
  v_counter int := 2;
  exists_id uuid;
begin
  if not public.ensure_current_user_platform_admin() then
    raise exception 'Forbidden: platform admin required';
  end if;

  select resource_id into v_id from public.idempotency_results where request_id = p_request_id and resource_type = 'organization';
  if v_id is not null then return v_id; end if;

  v_tenant := nullif(p_payload->>'tenant_id','')::uuid;
  v_base_slug := public.slugify(coalesce(p_payload->>'slug', p_payload->>'name'));
  if v_base_slug is null or v_base_slug = '' then v_base_slug := 'organization'; end if;
  v_slug := v_base_slug;

  if v_tenant is null then
    select id into exists_id from public.organizations where tenant_id is null and slug = v_slug limit 1;
    while exists_id is not null loop
      v_slug := v_base_slug || '-' || v_counter; v_counter := v_counter + 1;
      select id into exists_id from public.organizations where tenant_id is null and slug = v_slug limit 1;
    end loop;
  else
    select id into exists_id from public.organizations where tenant_id = v_tenant and slug = v_slug limit 1;
    while exists_id is not null loop
      v_slug := v_base_slug || '-' || v_counter; v_counter := v_counter + 1;
      select id into exists_id from public.organizations where tenant_id = v_tenant and slug = v_slug limit 1;
    end loop;
  end if;

  insert into public.organizations (
    tenant_id,
    name,
    slug,
    organization_type,
    organization_subtype,
    contact_email,
    contact_phone,
    address,
    description,
    settings,
    is_active
  ) values (
    v_tenant,
    (p_payload->>'name'),
    v_slug,
    (p_payload->>'organization_type')::public.organization_type,
    nullif(p_payload->>'organization_subtype',''),
    nullif(p_payload->>'contact_email',''),
    nullif(p_payload->>'contact_phone',''),
    coalesce(p_payload->'address','{}'::jsonb),
    nullif(p_payload->>'description',''),
    coalesce(p_payload->'settings','{}'::jsonb),
    coalesce((p_payload->>'is_active')::boolean, true)
  ) returning id into v_id;

  insert into public.idempotency_keys(id) values (p_request_id) on conflict do nothing;
  insert into public.idempotency_results(request_id, resource_type, resource_id) values (p_request_id, 'organization', v_id) on conflict do nothing;
  return v_id;
end; $$;

-- update_or_delete_organization_tx: require platform admin; generate unique slug on tenant change/update
create or replace function public.update_or_delete_organization_tx(
  p_org_id uuid,
  p_mode text,
  p_payload jsonb default '{}'::jsonb,
  p_request_id uuid default gen_random_uuid()
) returns void
language plpgsql security definer as $$
declare
  v_next_tenant uuid;
  v_next_name text;
  v_requested_slug text;
  v_slug text;
  v_base_slug text;
  v_counter int := 2;
  exists_id uuid;
begin
  if not public.ensure_current_user_platform_admin() then
    raise exception 'Forbidden: platform admin required';
  end if;

  perform 1 from public.idempotency_keys where id = p_request_id; if found then return; end if;

  if p_mode = 'delete' then
    delete from public.organizations where id = p_org_id;
  elsif p_mode = 'update' then
    v_next_tenant := nullif(p_payload->>'tenant_id','')::uuid;
    v_requested_slug := nullif(p_payload->>'slug','');
    v_next_name := nullif(p_payload->>'name','');

    if v_requested_slug is not null then
      v_base_slug := public.slugify(v_requested_slug);
    elsif v_next_name is not null then
      v_base_slug := public.slugify(v_next_name);
    else
      select slug into v_base_slug from public.organizations where id = p_org_id;
    end if;
    if v_base_slug is null or v_base_slug = '' then v_base_slug := 'organization'; end if;
    v_slug := v_base_slug;

    if v_next_tenant is null then
      select id into exists_id from public.organizations where tenant_id is null and slug = v_slug and id <> p_org_id limit 1;
      while exists_id is not null loop
        v_slug := v_base_slug || '-' || v_counter; v_counter := v_counter + 1;
        select id into exists_id from public.organizations where tenant_id is null and slug = v_slug and id <> p_org_id limit 1;
      end loop;
    else
      select id into exists_id from public.organizations where tenant_id = v_next_tenant and slug = v_slug and id <> p_org_id limit 1;
      while exists_id is not null loop
        v_slug := v_base_slug || '-' || v_counter; v_counter := v_counter + 1;
        select id into exists_id from public.organizations where tenant_id = v_next_tenant and slug = v_slug and id <> p_org_id limit 1;
      end loop;
    end if;

    update public.organizations set
      tenant_id = coalesce(v_next_tenant, tenant_id),
      slug = v_slug,
      name = coalesce(p_payload->>'name', name),
      contact_email = coalesce(p_payload->>'email', contact_email),
      contact_phone = coalesce(p_payload->>'phone', contact_phone),
      organization_type = coalesce(p_payload->>'organization_type', organization_type),
      organization_subtype = coalesce(p_payload->>'organization_subtype', organization_subtype),
      is_active = coalesce((p_payload->>'is_active')::boolean, is_active),
      address = coalesce(p_payload->'address', address)
    where id = p_org_id;
  else
    raise exception 'Unsupported mode %', p_mode;
  end if;

  insert into public.idempotency_keys(id) values (p_request_id) on conflict do nothing;
end; $$;


