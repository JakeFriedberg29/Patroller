-- Add audit logging to RPCs: set_platform_admin_assignment, create_organization_tx,
-- update_or_delete_organization_tx, update_enterprise_settings_tx

-- set_platform_admin_assignment: add idempotency + audit log
create or replace function public.set_platform_admin_assignment(
  p_admin_id uuid,
  p_account_id uuid,
  p_account_type text,
  p_is_active boolean,
  p_request_id uuid default gen_random_uuid()
) returns void
language plpgsql security definer as $$
declare
  v_actor uuid;
  v_tenant uuid;
  v_assignment_id uuid;
begin
  if not public.ensure_current_user_platform_admin() then
    raise exception 'Forbidden: platform admin required';
  end if;

  perform 1 from public.idempotency_keys where id = p_request_id; if found then return; end if;

  with upsert as (
    insert into public.platform_admin_account_assignments(platform_admin_id, account_id, account_type, is_active)
    values (p_admin_id, p_account_id, p_account_type, p_is_active)
    on conflict (platform_admin_id, account_id, account_type)
    do update set is_active = excluded.is_active
  )
  select 1;

  select id into v_assignment_id
  from public.platform_admin_account_assignments
  where platform_admin_id = p_admin_id
    and account_id = p_account_id
    and account_type = p_account_type
  limit 1;

  select id into v_actor from public.users where auth_user_id = auth.uid();
  if p_account_type = 'Organization' then
    select tenant_id into v_tenant from public.organizations where id = p_account_id;
  else
    v_tenant := p_account_id;
  end if;

  insert into public.audit_logs(tenant_id, user_id, action, resource_type, resource_id, metadata)
  values (
    coalesce(v_tenant, p_account_id),
    v_actor,
    'SET_PLATFORM_ADMIN_ASSIGNMENT',
    'platform_admin_assignment',
    v_assignment_id,
    jsonb_build_object(
      'is_active', p_is_active,
      'request_id', p_request_id,
      'platform_admin_id', p_admin_id,
      'account_id', p_account_id,
      'account_type', p_account_type
    )
  );

  insert into public.idempotency_keys(id) values (p_request_id) on conflict do nothing;
end; $$;

-- create_organization_tx: add audit log
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
  v_actor uuid;
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

  select id into v_actor from public.users where auth_user_id = auth.uid();
  insert into public.audit_logs(tenant_id, user_id, action, resource_type, resource_id, metadata)
  values (v_tenant, v_actor, 'CREATE_ORGANIZATION', 'organization', v_id, jsonb_build_object('request_id', p_request_id));

  insert into public.idempotency_keys(id) values (p_request_id) on conflict do nothing;
  insert into public.idempotency_results(request_id, resource_type, resource_id) values (p_request_id, 'organization', v_id) on conflict do nothing;
  return v_id;
end; $$;

-- update_or_delete_organization_tx: add audit logs for update and delete
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
  v_actor uuid;
  v_current_tenant uuid;
  v_effective_tenant uuid;
begin
  if not public.ensure_current_user_platform_admin() then
    raise exception 'Forbidden: platform admin required';
  end if;

  perform 1 from public.idempotency_keys where id = p_request_id; if found then return; end if;

  if p_mode = 'delete' then
    select tenant_id into v_current_tenant from public.organizations where id = p_org_id;
    delete from public.organizations where id = p_org_id;

    select id into v_actor from public.users where auth_user_id = auth.uid();
    insert into public.audit_logs(tenant_id, user_id, action, resource_type, resource_id, metadata)
    values (v_current_tenant, v_actor, 'DELETE_ORGANIZATION', 'organization', p_org_id, jsonb_build_object('request_id', p_request_id));
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

    select tenant_id into v_current_tenant from public.organizations where id = p_org_id;

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

    v_effective_tenant := coalesce(v_next_tenant, v_current_tenant);
    select id into v_actor from public.users where auth_user_id = auth.uid();
    insert into public.audit_logs(tenant_id, user_id, action, resource_type, resource_id, metadata)
    values (v_effective_tenant, v_actor, 'UPDATE_ORGANIZATION', 'organization', p_org_id, jsonb_build_object('request_id', p_request_id));
  else
    raise exception 'Unsupported mode %', p_mode;
  end if;

  insert into public.idempotency_keys(id) values (p_request_id) on conflict do nothing;
end; $$;

-- update_enterprise_settings_tx: add audit log
create or replace function public.update_enterprise_settings_tx(
  p_tenant_id uuid,
  p_payload jsonb,
  p_request_id uuid default gen_random_uuid()
) returns void
language plpgsql security definer as $$
declare
  v_actor uuid;
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

  select id into v_actor from public.users where auth_user_id = auth.uid();
  insert into public.audit_logs(tenant_id, user_id, action, resource_type, resource_id, metadata)
  values (p_tenant_id, v_actor, 'UPDATE_ENTERPRISE', 'enterprise', p_tenant_id, jsonb_build_object('request_id', p_request_id));

  insert into public.idempotency_keys(id) values (p_request_id) on conflict do nothing;
end; $$;


