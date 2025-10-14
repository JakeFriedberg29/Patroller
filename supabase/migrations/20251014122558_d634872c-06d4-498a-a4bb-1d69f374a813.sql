-- Replace subscription tiers with Bronze, Silver, Gold, Platinum

-- Step 1: Drop the function that depends on the old enum
DROP FUNCTION IF EXISTS public.tenant_create_with_org(text, text, text, text, organization_type, text, text, subscription_tier);

-- Step 2: Rename old enum and create new one
ALTER TYPE subscription_tier RENAME TO subscription_tier_old;

CREATE TYPE subscription_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');

-- Step 3: Update the enterprises table to use the new enum
ALTER TABLE public.enterprises 
  ALTER COLUMN subscription_tier DROP DEFAULT;

ALTER TABLE public.enterprises 
  ALTER COLUMN subscription_tier TYPE subscription_tier 
  USING CASE subscription_tier::text
    WHEN 'free' THEN 'bronze'::subscription_tier
    WHEN 'basic' THEN 'silver'::subscription_tier
    WHEN 'professional' THEN 'gold'::subscription_tier
    WHEN 'enterprise' THEN 'platinum'::subscription_tier
    WHEN 'custom' THEN 'platinum'::subscription_tier
  END;

ALTER TABLE public.enterprises 
  ALTER COLUMN subscription_tier SET DEFAULT 'bronze'::subscription_tier;

-- Step 4: Drop old enum type
DROP TYPE subscription_tier_old;

-- Step 5: Recreate the function with new enum
CREATE OR REPLACE FUNCTION public.tenant_create_with_org(
  p_tenant_name text, 
  p_tenant_slug text, 
  p_org_name text, 
  p_org_slug text, 
  p_org_type organization_type, 
  p_admin_email text, 
  p_admin_name text, 
  p_subscription_tier subscription_tier DEFAULT 'bronze'::subscription_tier
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    CASE WHEN p_subscription_tier = 'platinum' THEN 100 ELSE 1 END,
    CASE 
      WHEN p_subscription_tier = 'platinum' THEN 1000 
      WHEN p_subscription_tier = 'gold' THEN 100 
      ELSE 10 
    END
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
              WHEN p_subscription_tier = 'platinum' THEN 'enterprise_admin'::role_type 
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
$function$;