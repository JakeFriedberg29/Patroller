-- RPC to set report template status with tenancy and role checks
CREATE OR REPLACE FUNCTION public.set_report_template_status(
  p_template_id UUID,
  p_status public.report_template_status
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_tenant UUID;
  v_platform_admin BOOLEAN;
  v_row RECORD;
BEGIN
  v_current_tenant := public.get_current_user_tenant_id();
  v_platform_admin := public.ensure_current_user_platform_admin();
  IF NOT v_platform_admin THEN
    RETURN jsonb_build_object('success', false, 'error', 'forbidden');
  END IF;

  SELECT id, tenant_id INTO v_row
  FROM public.report_templates
  WHERE id = p_template_id;

  IF NOT FOUND OR v_row.tenant_id IS DISTINCT FROM v_current_tenant THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_found');
  END IF;

  -- Update status; transitions and side-effects are enforced by triggers
  UPDATE public.report_templates
  SET status = p_status
  WHERE id = p_template_id;

  RETURN jsonb_build_object('success', true, 'status', p_status);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;


