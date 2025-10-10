-- Update apply_report_template_status_effects to handle organization subtypes
CREATE OR REPLACE FUNCTION public.apply_report_template_status_effects()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  current_user_id uuid := null;
begin
  if auth.uid() is not null then
    select id into current_user_id from public.users where auth_user_id = auth.uid() limit 1;
  end if;

  if tg_op in ('INSERT','UPDATE') and new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    update public.patroller_report_visibility prv
    set visible_to_patrollers = true,
        updated_at = now()
    where prv.tenant_id = new.tenant_id
      and prv.template_id = new.id;

    -- Insert visibility records for organizations matching assigned organization_type OR organization_subtype
    insert into public.patroller_report_visibility (tenant_id, organization_id, template_id, visible_to_patrollers, created_by)
    select new.tenant_id, o.id, new.id, true, current_user_id
    from public.organizations o
    where o.tenant_id = new.tenant_id
      and (
        -- Match by organization_type enum
        exists (
          select 1
          from public.repository_assignments ra
          where ra.tenant_id = new.tenant_id
            and ra.element_type = 'report_template'
            and ra.target_type = 'organization_type'
            and ra.element_id = new.id
            and ra.target_organization_type = o.organization_type
        )
        OR
        -- Match by organization_subtype string/id
        exists (
          select 1
          from public.repository_assignments ra
          left join public.organization_subtypes os on ra.target_organization_subtype_id = os.id
          where ra.tenant_id = new.tenant_id
            and ra.element_type = 'report_template'
            and ra.target_type = 'organization_type'
            and ra.element_id = new.id
            and (
              -- Match by subtype name (for backward compatibility)
              o.organization_subtype = os.name
              OR
              -- Match if organization has a subtype that matches the assigned subtype_id
              exists (
                select 1 from public.organization_subtypes os2
                where os2.id = ra.target_organization_subtype_id
                  and os2.name = o.organization_subtype
              )
            )
        )
      )
      and not exists (
        select 1 from public.patroller_report_visibility prv2
        where prv2.tenant_id = new.tenant_id
          and prv2.organization_id = o.id
          and prv2.template_id = new.id
      );
  elsif tg_op = 'UPDATE' and old.status = 'published' and new.status = 'unpublished' then
    update public.patroller_report_visibility prv
    set visible_to_patrollers = false,
        updated_at = now()
    where prv.tenant_id = new.tenant_id
      and prv.template_id = new.id;
  end if;

  perform public.create_audit_log_partition(
    p_year := extract(year from now())::int,
    p_month := extract(month from now())::int
  );

  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into public.audit_logs (
      id, tenant_id, user_id, action, resource_type, resource_id, metadata, created_at
    ) values (
      gen_random_uuid(),
      new.tenant_id,
      current_user_id,
      'report_template_status_change',
      'report_template',
      new.id,
      jsonb_build_object('from', old.status, 'to', new.status),
      now()
    );
  end if;

  return new;
end;
$$;