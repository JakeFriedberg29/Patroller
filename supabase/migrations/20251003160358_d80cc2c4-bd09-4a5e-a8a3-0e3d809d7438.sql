-- Fix update_or_delete_organization_tx to handle type casting properly
CREATE OR REPLACE FUNCTION public.update_or_delete_organization_tx(
  p_org_id uuid, 
  p_mode text, 
  p_payload jsonb DEFAULT '{}'::jsonb, 
  p_request_id uuid DEFAULT gen_random_uuid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
  v_next_org_type text;
  v_next_org_subtype text;
begin
  if not public.ensure_current_user_platform_admin() then
    raise exception 'Forbidden: platform admin required';
  end if;

  perform 1 from public.idempotency_keys where id = p_request_id; 
  if found then return; end if;

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
    v_next_org_type := nullif(p_payload->>'organization_type','');
    v_next_org_subtype := nullif(p_payload->>'organization_subtype','');

    -- Generate slug
    if v_requested_slug is not null then
      v_base_slug := public.slugify(v_requested_slug);
    elsif v_next_name is not null then
      v_base_slug := public.slugify(v_next_name);
    else
      select slug into v_base_slug from public.organizations where id = p_org_id;
    end if;
    if v_base_slug is null or v_base_slug = '' then v_base_slug := 'organization'; end if;
    v_slug := v_base_slug;

    -- Check for slug conflicts
    if v_next_tenant is null then
      select id into exists_id from public.organizations 
      where tenant_id is null and slug = v_slug and id <> p_org_id limit 1;
      while exists_id is not null loop
        v_slug := v_base_slug || '-' || v_counter; 
        v_counter := v_counter + 1;
        select id into exists_id from public.organizations 
        where tenant_id is null and slug = v_slug and id <> p_org_id limit 1;
      end loop;
    else
      select id into exists_id from public.organizations 
      where tenant_id = v_next_tenant and slug = v_slug and id <> p_org_id limit 1;
      while exists_id is not null loop
        v_slug := v_base_slug || '-' || v_counter; 
        v_counter := v_counter + 1;
        select id into exists_id from public.organizations 
        where tenant_id = v_next_tenant and slug = v_slug and id <> p_org_id limit 1;
      end loop;
    end if;

    select tenant_id into v_current_tenant from public.organizations where id = p_org_id;

    -- Update organization with proper type handling
    update public.organizations set
      tenant_id = coalesce(v_next_tenant, tenant_id),
      slug = v_slug,
      name = coalesce(v_next_name, name),
      contact_email = coalesce(nullif(p_payload->>'email',''), contact_email),
      contact_phone = coalesce(nullif(p_payload->>'phone',''), contact_phone),
      organization_type = case 
        when v_next_org_type is not null then v_next_org_type::organization_type 
        else organization_type 
      end,
      organization_subtype = case
        when p_payload ? 'organization_subtype' then v_next_org_subtype
        else organization_subtype
      end,
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
end;
$$;