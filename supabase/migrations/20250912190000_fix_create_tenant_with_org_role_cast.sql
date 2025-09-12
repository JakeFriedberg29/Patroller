-- Fix: cast role to enum in create_tenant_with_organization when calling create_user
CREATE OR REPLACE FUNCTION public.create_tenant_with_organization(
  p_tenant_name TEXT,
  p_tenant_slug TEXT,
  p_org_name TEXT,
  p_org_slug TEXT,
  p_org_type organization_type,
  p_admin_email TEXT,
  p_admin_name TEXT,
  p_subscription_tier subscription_tier DEFAULT 'free'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_org_id UUID;
  v_admin_user_id UUID;
  result JSONB;
  v_role role_type;
BEGIN
  -- Create tenant
  INSERT INTO public.tenants (
    name, slug, subscription_tier, max_organizations, max_users
  ) VALUES (
    p_tenant_name,
    p_tenant_slug,
    p_subscription_tier,
    CASE WHEN p_subscription_tier = 'enterprise' THEN 100 ELSE 1 END,
    CASE WHEN p_subscription_tier = 'enterprise' THEN 1000 WHEN p_subscription_tier = 'professional' THEN 100 ELSE 10 END
  ) RETURNING id INTO v_tenant_id;

  -- Create default organization
  INSERT INTO public.organizations (
    tenant_id, name, slug, organization_type, contact_email
  ) VALUES (
    v_tenant_id,
    p_org_name,
    p_org_slug,
    p_org_type,
    p_admin_email
  ) RETURNING id INTO v_org_id;

  -- Determine admin role and cast to enum
  v_role := CASE 
              WHEN p_subscription_tier = 'enterprise' THEN 'enterprise_admin'::role_type 
              ELSE 'organization_admin'::role_type 
            END;

  -- Create admin user with explicit enum role
  SELECT public.create_user(
    p_admin_email,
    p_admin_name,
    v_tenant_id,
    v_org_id,
    v_role
  ) INTO v_admin_user_id;

  -- Return created IDs
  result := jsonb_build_object(
    'tenant_id', v_tenant_id,
    'organization_id', v_org_id,
    'admin_user_id', v_admin_user_id
  );

  RETURN result;
END;
$$;


