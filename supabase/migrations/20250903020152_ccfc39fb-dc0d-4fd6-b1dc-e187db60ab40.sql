-- Create audit log table for tracking admin deletions and other sensitive operations
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type text NOT NULL, -- 'delete', 'create', 'update', 'suspend', 'activate'
  target_user_id uuid,
  target_user_email text NOT NULL,
  target_user_name text NOT NULL,
  target_user_role text NOT NULL,
  performed_by_user_id uuid,
  performed_by_email text,
  account_id uuid,
  account_type text,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for audit log (only admins can view their own account's logs)
CREATE POLICY "Platform admins can view all audit logs" 
ON public.admin_audit_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'Platform Admin'
  )
);

CREATE POLICY "Enterprise admins can view their enterprise audit logs" 
ON public.admin_audit_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'Enterprise Admin'
    AND profiles.account_id = admin_audit_log.account_id
  )
);

CREATE POLICY "Organization admins can view their organization audit logs" 
ON public.admin_audit_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'Organization Admin'
    AND profiles.account_id = admin_audit_log.account_id
  )
);

-- Allow authenticated users to insert audit logs (system will validate permissions)
CREATE POLICY "Authenticated users can insert audit logs" 
ON public.admin_audit_log 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Add soft delete capability to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS deleted_by uuid,
ADD COLUMN IF NOT EXISTS deletion_reason text;

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action_type text,
  p_target_user_id uuid,
  p_target_user_email text,
  p_target_user_name text,
  p_target_user_role text,
  p_account_id uuid DEFAULT NULL,
  p_account_type text DEFAULT NULL,
  p_details jsonb DEFAULT '{}',
  p_deletion_reason text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  log_id uuid;
  current_user_profile RECORD;
BEGIN
  -- Get current user's profile info for audit
  SELECT user_id, email, full_name INTO current_user_profile
  FROM public.profiles
  WHERE user_id = auth.uid();
  
  -- Insert audit log
  INSERT INTO public.admin_audit_log (
    action_type,
    target_user_id,
    target_user_email,
    target_user_name,
    target_user_role,
    performed_by_user_id,
    performed_by_email,
    account_id,
    account_type,
    details
  ) VALUES (
    p_action_type,
    p_target_user_id,
    p_target_user_email,
    p_target_user_name,
    p_target_user_role,
    current_user_profile.user_id,
    current_user_profile.email,
    p_account_id,
    p_account_type,
    CASE 
      WHEN p_deletion_reason IS NOT NULL THEN 
        jsonb_build_object('deletion_reason', p_deletion_reason) || p_details
      ELSE p_details
    END
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

-- Create function to safely delete admin with audit logging
CREATE OR REPLACE FUNCTION public.delete_admin_with_audit(
  p_admin_id uuid,
  p_deletion_reason text DEFAULT 'Administrative action',
  p_hard_delete boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_record RECORD;
  current_user_profile RECORD;
  can_delete boolean := false;
  result jsonb;
BEGIN
  -- Get admin record to delete
  SELECT * INTO admin_record
  FROM public.profiles
  WHERE id = p_admin_id AND deleted_at IS NULL;
  
  IF admin_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Administrator not found or already deleted'
    );
  END IF;
  
  -- Get current user's profile for permission check
  SELECT * INTO current_user_profile
  FROM public.profiles
  WHERE user_id = auth.uid();
  
  IF current_user_profile IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: User not found'
    );
  END IF;
  
  -- Permission checks
  IF current_user_profile.role = 'Platform Admin' THEN
    can_delete := true;
  ELSIF current_user_profile.role = 'Enterprise Admin' AND 
        admin_record.account_type = 'organization' AND
        admin_record.account_id = current_user_profile.account_id THEN
    can_delete := true;
  ELSIF current_user_profile.role = 'Organization Admin' AND
        admin_record.account_type = 'organization' AND
        admin_record.account_id = current_user_profile.account_id AND
        admin_record.role != 'Organization Admin' THEN
    -- Organization admins can only delete non-admin users in their org
    can_delete := true;
  END IF;
  
  IF NOT can_delete THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient permissions to delete this administrator'
    );
  END IF;
  
  -- Log the deletion action
  PERFORM log_admin_action(
    'delete',
    admin_record.user_id,
    admin_record.email,
    admin_record.full_name,
    admin_record.role,
    admin_record.account_id,
    admin_record.account_type,
    jsonb_build_object('deletion_type', CASE WHEN p_hard_delete THEN 'hard' ELSE 'soft' END),
    p_deletion_reason
  );
  
  IF p_hard_delete THEN
    -- Hard delete - completely remove from database
    DELETE FROM public.profiles WHERE id = p_admin_id;
    result := jsonb_build_object(
      'success', true,
      'message', 'Administrator permanently deleted',
      'deletion_type', 'hard'
    );
  ELSE
    -- Soft delete - mark as deleted but keep record
    UPDATE public.profiles 
    SET 
      deleted_at = now(),
      deleted_by = auth.uid(),
      deletion_reason = p_deletion_reason,
      activation_status = 'suspended'
    WHERE id = p_admin_id;
    
    result := jsonb_build_object(
      'success', true,
      'message', 'Administrator account deactivated',
      'deletion_type', 'soft'
    );
  END IF;
  
  RETURN result;
END;
$function$;

-- Add index for better performance on audit queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target_user ON public.admin_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_account ON public.admin_audit_log(account_id, account_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action_date ON public.admin_audit_log(action_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at) WHERE deleted_at IS NOT NULL;