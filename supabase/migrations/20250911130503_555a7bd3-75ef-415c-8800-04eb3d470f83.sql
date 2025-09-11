-- Create platform admin account assignments table
CREATE TABLE public.platform_admin_account_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_admin_id UUID NOT NULL,
  account_id UUID NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('enterprise', 'organization')),
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(platform_admin_id, account_id, account_type)
);

-- Enable RLS
ALTER TABLE public.platform_admin_account_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Platform admins can manage all assignments" 
ON public.platform_admin_account_assignments 
FOR ALL 
USING (public.is_platform_admin())
WITH CHECK (public.is_platform_admin());

-- Create trigger for timestamps
CREATE TRIGGER update_platform_admin_account_assignments_updated_at
BEFORE UPDATE ON public.platform_admin_account_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();