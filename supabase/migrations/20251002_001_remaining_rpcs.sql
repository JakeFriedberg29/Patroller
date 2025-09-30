-- Remaining RPCs: create_report_tx, delete_enterprise_tx, supporting RPCs

-- RPC: create_report_tx
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
  -- idempotency
  perform 1 from public.idempotency_keys where id = p_request_id; if found then
    -- Return existing id if we wanted strict idempotency per unique key; for now just return null
    return null;
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
  return v_id;
end; $$;

-- RPC: delete_enterprise_tx
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
  perform 1 from public.idempotency_keys where id = p_request_id; if found then return; end if;

  select count(*) into v_org_count from public.organizations where tenant_id = p_tenant_id;
  if not p_force and v_org_count > 0 then
    raise exception 'Cannot delete enterprise with existing organizations. Set p_force=true to proceed.';
  end if;

  if p_force then
    -- For now, delete orgs; in future we could archive instead
    delete from public.organizations where tenant_id = p_tenant_id;
  end if;

  delete from public.enterprises where id = p_tenant_id;

  insert into public.audit_logs(tenant_id, user_id, action, resource_type, resource_id, metadata)
  values (p_tenant_id, p_actor_id, 'DELETE_ENTERPRISE', 'enterprise', p_tenant_id, jsonb_build_object('forced', p_force, 'request_id', p_request_id));

  insert into public.idempotency_keys(id) values (p_request_id) on conflict do nothing;
end; $$;

-- Supporting RPC: update_enterprise_settings_tx
create or replace function public.update_enterprise_settings_tx(
  p_tenant_id uuid,
  p_payload jsonb,
  p_request_id uuid default gen_random_uuid()
) returns void
language plpgsql security definer as $$
begin
  perform 1 from public.idempotency_keys where id = p_request_id; if found then return; end if;

  update public.enterprises
  set
    name = coalesce(p_payload->>'name', name),
    settings = coalesce(p_payload->'settings', settings),
    subscription_status = coalesce(p_payload->>'subscription_status', subscription_status)
  where id = p_tenant_id;

  insert into public.idempotency_keys(id) values (p_request_id) on conflict do nothing;
end; $$;

-- Supporting RPC: create_organization_tx
create or replace function public.create_organization_tx(
  p_payload jsonb,
  p_request_id uuid default gen_random_uuid()
) returns uuid
language plpgsql security definer as $$
declare
  v_id uuid;
begin
  perform 1 from public.idempotency_keys where id = p_request_id; if found then return null; end if;

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
    nullif(p_payload->>'tenant_id','')::uuid,
    (p_payload->>'name'),
    (p_payload->>'slug'),
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
  return v_id;
end; $$;


