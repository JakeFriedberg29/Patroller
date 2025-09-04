-- =====================================================
-- ENABLE PGCRYPTO EXTENSION FOR RANDOM BYTES
-- Required for generating secure activation tokens
-- =====================================================

-- Enable the pgcrypto extension for secure random byte generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Test the function now that extension is enabled
SELECT encode(gen_random_bytes(32), 'base64url') as test_token;