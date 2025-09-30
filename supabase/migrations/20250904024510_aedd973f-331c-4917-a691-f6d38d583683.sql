-- =====================================================
-- PATROLLER CONSOLE DATABASE FINAL SETUP
-- Complete the database architecture
-- =====================================================

-- Add missing foreign key constraint
ALTER TABLE public.departments 
ADD CONSTRAINT fk_departments_head_user 
FOREIGN KEY (head_user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Create a simple demo setup
INSERT INTO public.tenants (name, slug, subscription_tier, max_organizations, max_users) 
VALUES ('Demo Emergency Services', 'demo-emergency', 'professional', 5, 100)
ON CONFLICT (slug) DO NOTHING;

-- Final statistics update
ANALYZE public.tenants;
ANALYZE public.organizations;
ANALYZE public.users;
ANALYZE public.user_roles;