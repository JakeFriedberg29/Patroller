-- Update existing users with their correct auth_user_id from auth.users table
-- This fixes the login issue where users exist in auth but aren't linked to the database records

UPDATE users 
SET auth_user_id = '84c0e629-3934-4146-a5c6-3fefcdecc61e', status = 'active', email_verified = true
WHERE email = 'sarah.johnson@megacorp.com' AND auth_user_id IS NULL;

-- Let's also check for other auth users that might need linking
-- This query helps identify any other disconnected auth users
COMMENT ON TABLE users IS 'Updated sarah.johnson@megacorp.com auth_user_id to fix login redirection issue';