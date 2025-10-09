-- Add new user status values to support the full status lifecycle
-- Adding 'disabled' and 'deleted' statuses
ALTER TYPE user_status ADD VALUE IF NOT EXISTS 'disabled';
ALTER TYPE user_status ADD VALUE IF NOT EXISTS 'deleted';

-- Add comment for clarity on status meanings
COMMENT ON TYPE user_status IS 'User activation statuses: pending (not yet activated), active (activated and can login), disabled (admin disabled access), deleted (soft delete - hidden from UI but kept in logs), suspended (deprecated - use disabled instead)';
