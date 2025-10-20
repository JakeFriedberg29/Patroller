-- Fix report template status effects to handle cross-tenant propagation
-- When a platform template is published, it should create visibility records
-- for ALL organizations across ALL tenants that match the assigned subtypes

CREATE OR REPLACE FUNCTION public.apply_report_template_status_effects()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  current_user_id uuid := null;
  visibility_table_name text;
begin
  if auth.uid() is not null then
    select id into current_user_id from public.users where auth_user_id = auth.uid() limit 1;
  end if;

  -- Determine the correct table name (handle both old and new names)
  if exists (select 1 from pg_tables where tablename = 'patroller_report_visibility' and schemaname = 'public') then
    visibility_table_name := 'patroller_report_visibility';
  else
    visibility_table_name := 'organization_report_settings';
  end if;

  -- When publishing: create visibility for ALL organizations across ALL tenants that match assigned subtypes
  if tg_op in ('INSERT','UPDATE') and new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    
    -- Update existing visibility records
    if visibility_table_name = 'patroller_report_visibility' then
      update public.patroller_report_visibility prv
      set visible_to_patrollers = true,
          updated_at = now()
      where prv.template_id = new.id;
    else
      update public.organization_report_settings ors
      set visible_to_responders = true,
          updated_at = now()
      where ors.template_id = new.id;
    end if;

    -- Insert visibility records for organizations matching assigned subtypes (across ALL tenants)
    if visibility_table_name = 'patroller_report_visibility' then
      insert into public.patroller_report_visibility (tenant_id, organization_id, template_id, visible_to_patrollers, created_by)
      select o.tenant_id, o.id, new.id, true, current_user_id
      from public.organizations o
      where o.tenant_id is not null
        and exists (
          select 1
          from public.repository_assignments ra
          left join public.organization_subtypes os on ra.target_organization_subtype_id = os.id
          where ra.element_type = 'report_template'
            and ra.target_type = 'organization_type'
            and ra.element_id = new.id
            and ra.tenant_id = o.tenant_id  -- Match assignment in org's tenant
            and (
              -- Match by organization_type enum (if still used)
              ra.target_organization_type = o.organization_type
              OR
              -- Match by organization_subtype string
              (os.name is not null and o.organization_subtype = os.name)
            )
        )
        and not exists (
          select 1 from public.patroller_report_visibility prv2
          where prv2.tenant_id = o.tenant_id
            and prv2.organization_id = o.id
            and prv2.template_id = new.id
        );
    else
      insert into public.organization_report_settings (tenant_id, organization_id, template_id, visible_to_responders, created_by)
      select o.tenant_id, o.id, new.id, true, current_user_id
      from public.organizations o
      where o.tenant_id is not null
        and exists (
          select 1
          from public.repository_assignments ra
          left join public.organization_subtypes os on ra.target_organization_subtype_id = os.id
          where ra.element_type = 'report_template'
            and ra.target_type = 'organization_type'
            and ra.element_id = new.id
            and ra.tenant_id = o.tenant_id  -- Match assignment in org's tenant
            and (
              -- Match by organization_type enum (if still used)
              ra.target_organization_type = o.organization_type
              OR
              -- Match by organization_subtype string
              (os.name is not null and o.organization_subtype = os.name)
            )
        )
        and not exists (
          select 1 from public.organization_report_settings ors2
          where ors2.tenant_id = o.tenant_id
            and ors2.organization_id = o.id
            and ors2.template_id = new.id
        );
    end if;

  elsif tg_op = 'UPDATE' and old.status = 'published' and new.status = 'unpublished' then
    -- Unpublish: hide from responders across ALL tenants
    if visibility_table_name = 'patroller_report_visibility' then
      update public.patroller_report_visibility prv
      set visible_to_patrollers = false,
          updated_at = now()
      where prv.template_id = new.id;
    else
      update public.organization_report_settings ors
      set visible_to_responders = false,
          updated_at = now()
      where ors.template_id = new.id;
    end if;
  end if;

  -- Create audit log partition if needed
  perform public.create_audit_log_partition(
    p_year := extract(year from now())::int,
    p_month := extract(month from now())::int
  );

  -- Log status changes
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

-- Ensure the trigger is attached to report_templates
DROP TRIGGER IF EXISTS trigger_report_template_status_effects ON public.report_templates;
CREATE TRIGGER trigger_report_template_status_effects
AFTER INSERT OR UPDATE ON public.report_templates
FOR EACH ROW
EXECUTE FUNCTION public.apply_report_template_status_effects();

