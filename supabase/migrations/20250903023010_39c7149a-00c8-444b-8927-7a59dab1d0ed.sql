-- Create accounts table
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Enterprise', 'Organization')),
  category TEXT NOT NULL CHECK (category IN ('Search and Rescue', 'Lifeguard Service', 'Park Service', 'Event Medical', 'Ski Patrol', 'Harbor Master', 'Volunteer Emergency Services')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  location TEXT,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for accounts
CREATE POLICY "Platform admins can view all accounts" 
ON public.accounts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'Platform Admin'
));

CREATE POLICY "Enterprise admins can view their own account" 
ON public.accounts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND role = 'Enterprise Admin' 
  AND account_id = accounts.id
));

CREATE POLICY "Organization admins can view their own account" 
ON public.accounts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND role = 'Organization Admin' 
  AND account_id = accounts.id
));

CREATE POLICY "Platform admins can create accounts" 
ON public.accounts 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'Platform Admin'
));

CREATE POLICY "Platform admins can update all accounts" 
ON public.accounts 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'Platform Admin'
));

CREATE POLICY "Enterprise admins can update their own account" 
ON public.accounts 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND role = 'Enterprise Admin' 
  AND account_id = accounts.id
));

CREATE POLICY "Platform admins can delete accounts" 
ON public.accounts 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'Platform Admin'
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_accounts_updated_at
BEFORE UPDATE ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data
INSERT INTO public.accounts (name, type, category, status, location, contact_email) VALUES
('Mountain Rescue Team', 'Organization', 'Search and Rescue', 'active', 'Colorado Mountains', 'contact@mountainrescue.org'),
('Coastal Emergency Services', 'Enterprise', 'Lifeguard Service', 'active', 'California Coast', 'admin@coastalemergency.com'),
('National Park Rangers', 'Enterprise', 'Park Service', 'active', 'Yellowstone National Park', 'rangers@nps.gov'),
('Music Festival Medical', 'Organization', 'Event Medical', 'active', 'Austin, TX', 'medical@musicfest.com'),
('Alpine Ski Patrol', 'Organization', 'Ski Patrol', 'active', 'Aspen Resort', 'patrol@alpineski.com');