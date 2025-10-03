-- Add active_persona tracking to users table
-- This allows users with multiple roles to switch between admin and patroller personas

COMMENT ON COLUMN public.users.preferences IS 'User preferences including active_persona (admin or patroller)';

-- Create function to set active persona
CREATE OR REPLACE FUNCTION public.set_user_active_persona(p_persona text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get current user
  SELECT id INTO v_user_id
  FROM public.users
  WHERE auth_user_id = auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Validate persona
  IF p_persona NOT IN ('admin', 'patroller') THEN
    RAISE EXCEPTION 'Invalid persona: must be admin or patroller';
  END IF;

  -- Update preferences with active persona
  UPDATE public.users
  SET preferences = jsonb_set(
    COALESCE(preferences, '{}'::jsonb),
    '{active_persona}',
    to_jsonb(p_persona)
  )
  WHERE id = v_user_id;
END;
$$;

-- Allow authenticated users to call this function
GRANT EXECUTE ON FUNCTION public.set_user_active_persona(text) TO authenticated;