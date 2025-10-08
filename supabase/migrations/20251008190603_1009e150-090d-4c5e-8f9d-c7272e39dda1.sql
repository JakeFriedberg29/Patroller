-- =====================================================
-- REMOVE TENANTS VIEW AND USE ENTERPRISES DIRECTLY
-- Tenants is just a view over enterprises - remove it
-- =====================================================

-- Step 1: Drop the tenants view
DROP VIEW IF EXISTS public.tenants CASCADE;

-- Step 2: Update the tenant_create_with_org function to use enterprises directly
DROP FUNCTION IF EXISTS public.tenant_create_with_org(text, text, text, text, organization_type, text, text, subscription_tier);

CREATE OR REPLACE FUNCTION public.tenant_create_with_org(
  p_tenant_name text,
  p_tenant_slug text,
  p_org_name text,
  p_org_slug text,
  p_org_type organization_type,
  p_admin_email text,
  p_admin_name text,
  p_subscription_tier subscription_tier DEFAULT 'free'::subscription_tier
)
RETURNS jsonb
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
  -- Insert into enterprises table
  INSERT INTO public.enterprises (
    name, slug, subscription_tier, max_organizations, max_users
  ) VALUES (
    p_tenant_name,
    p_tenant_slug,
    p_subscription_tier,
    CASE WHEN p_subscription_tier = 'enterprise' THEN 100 ELSE 1 END,
    CASE WHEN p_subscription_tier = 'enterprise' THEN 1000 WHEN p_subscription_tier = 'professional' THEN 100 ELSE 10 END
  ) RETURNING id INTO v_tenant_id;

  INSERT INTO public.organizations (
    tenant_id, name, slug, organization_type, contact_email
  ) VALUES (
    v_tenant_id,
    p_org_name,
    p_org_slug,
    p_org_type,
    p_admin_email
  ) RETURNING id INTO v_org_id;

  v_role := CASE 
              WHEN p_subscription_tier = 'enterprise' THEN 'enterprise_admin'::role_type 
              ELSE 'organization_admin'::role_type 
            END;

  SELECT public.create_user(
    p_admin_email,
    p_admin_name,
    v_tenant_id,
    v_org_id,
    v_role
  ) INTO v_admin_user_id;

  result := jsonb_build_object(
    'tenant_id', v_tenant_id,
    'organization_id', v_org_id,
    'admin_user_id', v_admin_user_id
  );

  RETURN result;
END;
$$;

-- Note: All foreign keys already point to enterprises table (tenant_id columns)
-- The tenants view was just an alias, so no schema changes needed