-- Update status effects to ensure audit partition and use repository_assignments
create or replace function public.apply_report_template_status_effects()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := null;
begin
  -- Resolve current app user id
  if auth.uid() is not null then
    select id into current_user_id from public.users where auth_user_id = auth.uid() limit 1;
  end if;

  -- When publishing, enable visibility for matching orgs
  if tg_op in ('INSERT','UPDATE') and new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    update public.organization_report_settings ors
    set visible_to_responders = true,
        updated_at = now()
    where ors.tenant_id = new.tenant_id
      and ors.template_id = new.id;

    insert into public.organization_report_settings (tenant_id, organization_id, template_id, visible_to_responders, created_by)
    select new.tenant_id, o.id, new.id, true, current_user_id
    from public.organizations o
    where o.tenant_id = new.tenant_id
      and exists (
        select 1
        from public.repository_assignments ra
        where ra.tenant_id = new.tenant_id
          and ra.element_type = 'report_template'
          and ra.target_type = 'organization_type'
          and ra.element_id = new.id
          and ra.target_organization_type = o.organization_type
      )
      and not exists (
        select 1
        from public.organization_report_settings ors2
        where ors2.tenant_id = new.tenant_id
          and ors2.organization_id = o.id
          and ors2.template_id = new.id
      );
  elsif tg_op = 'UPDATE' and old.status = 'published' and new.status = 'unpublished' then
    update public.organization_report_settings ors
    set visible_to_responders = false,
        updated_at = now()
    where ors.tenant_id = new.tenant_id
      and ors.template_id = new.id;
  end if;

  -- Ensure an audit_logs partition exists for this month before logging
  perform public.create_audit_log_partition(
    p_year := extract(year from now())::int,
    p_month := extract(month from now())::int
  );

  -- Audit log on status change
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into public.audit_logs (
      id, tenant_id, user_id, action, resource_type, resource_id, metadata, created_at
    ) values (
      gen_random_uuid(),
      new.tenant_id,
      current_user_id,
      'report_template_status_change',
      'report_template',
      new.id::text,
      jsonb_build_object('from', old.status, 'to', new.status),
      now()
    );
  end if;

  return new;
end;
$$;
