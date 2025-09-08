-- Create function to clean up all dummy/seed data
CREATE OR REPLACE FUNCTION public.cleanup_dummy_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_counts jsonb := '{}';
  temp_count integer;
BEGIN
  -- Delete incidents
  DELETE FROM public.incidents;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := deleted_counts || jsonb_build_object('incidents', temp_count);
  
  -- Delete equipment
  DELETE FROM public.equipment;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := deleted_counts || jsonb_build_object('equipment', temp_count);
  
  -- Delete locations
  DELETE FROM public.locations;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := deleted_counts || jsonb_build_object('locations', temp_count);
  
  -- Delete user roles
  DELETE FROM public.user_roles;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := deleted_counts || jsonb_build_object('user_roles', temp_count);
  
  -- Delete users (this will cascade to auth.users)
  DELETE FROM public.users;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := deleted_counts || jsonb_build_object('users', temp_count);
  
  -- Delete organizations
  DELETE FROM public.organizations;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := deleted_counts || jsonb_build_object('organizations', temp_count);
  
  -- Delete tenants
  DELETE FROM public.tenants;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := deleted_counts || jsonb_build_object('tenants', temp_count);
  
  -- Delete notifications
  DELETE FROM public.notifications;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := deleted_counts || jsonb_build_object('notifications', temp_count);
  
  -- Delete audit logs
  DELETE FROM public.audit_logs;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := deleted_counts || jsonb_build_object('audit_logs', temp_count);
  
  -- Delete security events
  DELETE FROM public.security_events;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_counts := deleted_counts || jsonb_build_object('security_events', temp_count);

  RETURN jsonb_build_object(
    'success', true,
    'message', 'All dummy data deleted successfully',
    'deleted_counts', deleted_counts
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'deleted_counts', deleted_counts
  );
END;
$function$;