-- Stored procedure renames per stored-procedures-rules
-- Includes safe renames and compatibility wrappers for old names

-- Rename functions (use IF EXISTS for safety)
-- System/utility
DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.create_audit_log_partition(integer, integer)
    RENAME TO audit_log_create_partition;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.cleanup_dummy_data()
    RENAME TO system_cleanup_dummy_data;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.global_search(text, integer)
    RENAME TO system_global_search;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.slugify(text)
    RENAME TO system_slugify;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

-- User activation & creation
DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.activate_user_account(text)
    RENAME TO user_activate_account;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.activate_user_account_with_password(text, text)
    RENAME TO user_activate_account_with_code;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.generate_activation_token(uuid)
    RENAME TO user_generate_activation_token;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.create_pending_user(text, text, uuid, uuid, role_type, text, text, text)
    RENAME TO user_create_pending;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.create_pending_user(text, text, uuid, uuid, role_type, text, text)
    RENAME TO user_create_pending;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.create_user(text, text, uuid, uuid, role_type, text, text)
    RENAME TO user_create;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.create_user_with_activation(text, text, uuid, uuid, text, text, text, role_type)
    RENAME TO user_create_with_activation;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.create_user_with_activation(text, text, uuid, uuid, text, text, role_type)
    RENAME TO user_create_with_activation;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

-- Current user helpers and permission checks
DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.get_current_user_organization_id()
    RENAME TO user_get_current_org;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.get_current_user_tenant_id()
    RENAME TO user_get_current_tenant_id;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.has_org_read()
    RENAME TO user_has_org_read;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.has_org_write()
    RENAME TO user_has_org_write;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.has_tenant_read()
    RENAME TO user_has_tenant_read;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.has_tenant_write()
    RENAME TO user_has_tenant_write;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.is_platform_admin()
    RENAME TO platform_is_admin;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.set_user_active_persona(text)
    RENAME TO user_set_active_persona;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

-- Organization subtype maintenance
DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.add_organization_subtype(text)
    RENAME TO organization_add_subtype;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.delete_organization_subtype(text)
    RENAME TO organization_delete_subtype;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.rename_organization_subtype(text, text)
    RENAME TO organization_rename_subtype;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

-- Organization/Enterprise transactions
DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.update_or_delete_organization_tx(uuid, text, jsonb, uuid)
    RENAME TO organization_update_or_delete;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

-- create_organization_tx keeps same name per mapping

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.delete_enterprise_tx(uuid, uuid, boolean, uuid)
    RENAME TO enterprise_delete_tx;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.update_enterprise_settings_tx(uuid, jsonb, uuid)
    RENAME TO enterprise_update_settings_tx;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.create_tenant_with_organization(text, text, text, text, organization_type, text, text, subscription_tier)
    RENAME TO tenant_create_with_org;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.set_platform_admin_assignment(uuid, uuid, text, boolean, uuid)
    RENAME TO platform_set_admin_assignment;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

-- Reports/Notifications
DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.delete_report_template(uuid, uuid, uuid, uuid)
    RENAME TO report_template_delete;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.set_report_template_status(uuid, report_template_status)
    RENAME TO report_template_set_status;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.create_report_tx(uuid, jsonb, uuid)
    RENAME TO report_create_tx;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.create_incident(text, text, text, incident_priority, uuid, timestamp with time zone)
    RENAME TO report_create_incident;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.send_notification(uuid[], text, text, text, timestamp with time zone)
    RENAME TO notification_send;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

-- Assertions
DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.assert_record_matches_org_tenant(uuid, uuid)
    RENAME TO _assert_record_matches_org_tenant;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.assert_same_tenant_for_user_and_org(uuid, uuid)
    RENAME TO _assert_same_tenant_for_user;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION IF EXISTS public.ensure_current_user_platform_admin()
    RENAME TO _assert_current_user_platform_admin;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

-- Compatibility wrappers for old names to avoid breaking existing policies/triggers/app calls
-- Note: wrappers are SECURITY DEFINER and STABLE as appropriate

-- System/utility wrappers
CREATE OR REPLACE FUNCTION public.create_audit_log_partition(p_year integer, p_month integer)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.audit_log_create_partition($1, $2);
$$;

CREATE OR REPLACE FUNCTION public.cleanup_dummy_data()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.system_cleanup_dummy_data();
$$;

CREATE OR REPLACE FUNCTION public.global_search(p_query text, p_limit integer)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.system_global_search($1, $2);
$$;

CREATE OR REPLACE FUNCTION public.slugify(p_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT public.system_slugify($1);
$$;

-- User activation & creation wrappers
CREATE OR REPLACE FUNCTION public.activate_user_account(p_activation_token text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.user_activate_account($1);
$$;

CREATE OR REPLACE FUNCTION public.activate_user_account_with_password(p_activation_token text, p_password text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.user_activate_account_with_code($1, $2);
$$;

CREATE OR REPLACE FUNCTION public.generate_activation_token(p_user_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.user_generate_activation_token($1);
$$;

CREATE OR REPLACE FUNCTION public.create_pending_user(p_email text, p_full_name text, p_tenant_id uuid, p_organization_id uuid, p_role_type role_type, p_phone text, p_department text, p_location text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.user_create_pending($1, $2, $3, $4, $5, $6, $7, $8);
$$;

CREATE OR REPLACE FUNCTION public.create_pending_user(p_email text, p_full_name text, p_tenant_id uuid, p_organization_id uuid, p_role_type role_type, p_phone text, p_location text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.user_create_pending($1, $2, $3, $4, $5, $6, $7);
$$;

CREATE OR REPLACE FUNCTION public.create_user(p_email text, p_full_name text, p_tenant_id uuid, p_organization_id uuid, p_role_type role_type, p_phone text, p_employee_id text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.user_create($1, $2, $3, $4, $5, $6, $7);
$$;

CREATE OR REPLACE FUNCTION public.create_user_with_activation(p_email text, p_full_name text, p_tenant_id uuid, p_organization_id uuid, p_phone text, p_department text, p_location text, p_role_type role_type)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.user_create_with_activation($1, $2, $3, $4, $5, $6, $7, $8);
$$;

CREATE OR REPLACE FUNCTION public.create_user_with_activation(p_email text, p_full_name text, p_tenant_id uuid, p_organization_id uuid, p_phone text, p_location text, p_role_type role_type)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.user_create_with_activation($1, $2, $3, $4, $5, $6, $7);
$$;

-- Current user helpers and permission checks wrappers
CREATE OR REPLACE FUNCTION public.get_current_user_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.user_get_current_org();
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.user_get_current_tenant_id();
$$;

CREATE OR REPLACE FUNCTION public.has_org_read()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.user_has_org_read();
$$;

CREATE OR REPLACE FUNCTION public.has_org_write()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.user_has_org_write();
$$;

CREATE OR REPLACE FUNCTION public.has_tenant_read()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.user_has_tenant_read();
$$;

CREATE OR REPLACE FUNCTION public.has_tenant_write()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.user_has_tenant_write();
$$;

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.platform_is_admin();
$$;

CREATE OR REPLACE FUNCTION public.set_user_active_persona(p_persona text)
RETURNS void
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.user_set_active_persona($1);
$$;

-- Organization subtype wrappers
CREATE OR REPLACE FUNCTION public.add_organization_subtype(p_name text)
RETURNS void
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.organization_add_subtype($1);
$$;

CREATE OR REPLACE FUNCTION public.delete_organization_subtype(p_name text)
RETURNS void
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.organization_delete_subtype($1);
$$;

CREATE OR REPLACE FUNCTION public.rename_organization_subtype(p_old_name text, p_new_name text)
RETURNS void
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.organization_rename_subtype($1, $2);
$$;

-- Organization/Enterprise txn wrappers
CREATE OR REPLACE FUNCTION public.update_or_delete_organization_tx(p_org_id uuid, p_mode text, p_payload jsonb, p_request_id uuid)
RETURNS void
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.organization_update_or_delete($1, $2, $3, $4);
$$;

CREATE OR REPLACE FUNCTION public.delete_enterprise_tx(p_tenant_id uuid, p_actor_id uuid, p_force boolean, p_request_id uuid)
RETURNS void
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.enterprise_delete_tx($1, $2, $3, $4);
$$;

CREATE OR REPLACE FUNCTION public.update_enterprise_settings_tx(p_tenant_id uuid, p_payload jsonb, p_request_id uuid)
RETURNS void
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.enterprise_update_settings_tx($1, $2, $3);
$$;

CREATE OR REPLACE FUNCTION public.create_tenant_with_organization(p_tenant_name text, p_tenant_slug text, p_org_name text, p_org_slug text, p_org_type organization_type, p_admin_email text, p_admin_name text, p_subscription_tier subscription_tier)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.tenant_create_with_org($1, $2, $3, $4, $5, $6, $7, $8);
$$;

CREATE OR REPLACE FUNCTION public.set_platform_admin_assignment(p_admin_id uuid, p_account_id uuid, p_account_type text, p_is_active boolean, p_request_id uuid)
RETURNS void
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.platform_set_admin_assignment($1, $2, $3, $4, $5);
$$;

-- Reports/Notifications wrappers
CREATE OR REPLACE FUNCTION public.delete_report_template(p_tenant_id uuid, p_template_id uuid, p_actor_id uuid, p_request_id uuid)
RETURNS void
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.report_template_delete($1, $2, $3, $4);
$$;

CREATE OR REPLACE FUNCTION public.set_report_template_status(p_template_id uuid, p_status report_template_status)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.report_template_set_status($1, $2);
$$;

CREATE OR REPLACE FUNCTION public.create_report_tx(p_actor_id uuid, p_payload jsonb, p_request_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.report_create_tx($1, $2, $3);
$$;

CREATE OR REPLACE FUNCTION public.create_incident(p_title text, p_description text, p_incident_type text, p_priority incident_priority, p_location_id uuid, p_occurred_at timestamp with time zone)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.report_create_incident($1, $2, $3, $4, $5, $6);
$$;

CREATE OR REPLACE FUNCTION public.send_notification(p_user_ids uuid[], p_title text, p_message text, p_type text, p_expires_at timestamp with time zone)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.notification_send($1, $2, $3, $4, $5);
$$;

-- Assertions wrappers
CREATE OR REPLACE FUNCTION public.assert_record_matches_org_tenant(p_org_id uuid, p_tenant_id uuid)
RETURNS void
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public._assert_record_matches_org_tenant($1, $2);
$$;

CREATE OR REPLACE FUNCTION public.assert_same_tenant_for_user_and_org(p_user_id uuid, p_org_id uuid)
RETURNS void
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public._assert_same_tenant_for_user($1, $2);
$$;

CREATE OR REPLACE FUNCTION public.ensure_current_user_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public._assert_current_user_platform_admin();
$$;


