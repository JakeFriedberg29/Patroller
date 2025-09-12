-- Refresh schema to regenerate types
-- This is a harmless migration to trigger type regeneration
DO $$ 
BEGIN 
    -- Add a comment to trigger schema refresh without changing structure
    COMMENT ON SCHEMA public IS 'Schema refreshed for type regeneration';
END $$;