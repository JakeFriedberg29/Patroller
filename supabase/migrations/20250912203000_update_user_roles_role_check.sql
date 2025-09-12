-- Align user_roles role_type check with full allowed enum values
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_type_allowed_chk;

ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_type_allowed_chk
CHECK (
  role_type = ANY (
    ARRAY[
      'platform_admin'::role_type,
      'enterprise_admin'::role_type,
      'organization_admin'::role_type,
      'supervisor'::role_type,
      'member'::role_type,
      'observer'::role_type,
      'responder'::role_type,
      'team_leader'::role_type,
      'enterprise_user'::role_type,
      'organization_user'::role_type
    ]
  )
);


