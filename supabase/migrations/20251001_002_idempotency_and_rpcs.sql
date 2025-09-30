-- Idempotency table
create table if not exists public.idempotency_keys (
  id uuid primary key,
  created_at timestamptz not null default now()
);

-- RPC 1: delete_report_template (atomic + audited)
create or replace function public.delete_report_template(
  p_tenant_id uuid,
  p_template_id uuid,
  p_actor_id uuid,
  p_request_id uuid default gen_random_uuid()
) returns void language plpgsql security definer as $$
begin
  -- idempotency
  perform 1 from public.idempotency_keys where id = p_request_id; if found then return; end if;

  -- ensure exists and archived
  if not exists (
    select 1 from public.report_templates
    where id = p_template_id and tenant_id = p_tenant_id and status = 'archived'
    for update
  ) then
    raise exception 'Only archived reports can be deleted or template not found';
  end if;

  delete from public.report_templates where id = p_template_id and tenant_id = p_tenant_id;

  insert into public.audit_logs(tenant_id, user_id, action, resource_type, resource_id, metadata)
  values (p_tenant_id, p_actor_id, 'DELETE_REPORT_TEMPLATE', 'report_template', p_template_id, '{}'::jsonb);

  insert into public.idempotency_keys(id) values (p_request_id) on conflict do nothing;
end; $$;

-- RPC 2: set_platform_admin_assignment (add or remove via boolean)
create or replace function public.set_platform_admin_assignment(
  p_admin_id uuid,
  p_account_id uuid,
  p_account_type text,
  p_is_active boolean,
  p_request_id uuid default gen_random_uuid()
) returns void language sql security definer as $$
with upsert as (
  insert into public.platform_admin_account_assignments(platform_admin_id, account_id, account_type, is_active)
  values (p_admin_id, p_account_id, p_account_type, p_is_active)
  on conflict (platform_admin_id, account_id, account_type)
  do update set is_active = excluded.is_active
)
insert into public.idempotency_keys(id) values (p_request_id)
  on conflict do nothing;
$$;

-- RPC 3: update_or_delete_organization_tx
create or replace function public.update_or_delete_organization_tx(
  p_org_id uuid,
  p_mode text,                 -- 'update' | 'delete'
  p_payload jsonb default '{}'::jsonb, -- fields for update
  p_request_id uuid default gen_random_uuid()
) returns void language plpgsql security definer as $$
declare
  v_next_tenant uuid;
  v_next_slug text;
begin
  -- idempotency
  perform 1 from public.idempotency_keys where id = p_request_id; if found then return; end if;

  if p_mode = 'delete' then
    -- perform safety checks here as needed (e.g., no dependent critical data)
    delete from public.organizations where id = p_org_id;
  elsif p_mode = 'update' then
    v_next_tenant := nullif(p_payload->>'tenant_id','')::uuid;
    v_next_slug := nullif(p_payload->>'slug','');

    -- Basic guarded update; server owns slug if tenant changes
    update public.organizations set
      tenant_id = coalesce(v_next_tenant, tenant_id),
      slug = coalesce(v_next_slug, slug),
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


