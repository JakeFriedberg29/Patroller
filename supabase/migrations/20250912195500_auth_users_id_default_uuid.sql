-- Safe migration: ensure auth.users.id auto-generates UUIDs
-- Idempotent and non-destructive

-- Ensure pgcrypto exists in the database (schema-independent)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  -- Set default only if missing
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_schema = 'auth'
      AND c.table_name = 'users'
      AND c.column_name = 'id'
      AND c.column_default IS NULL
  ) THEN
    ALTER TABLE auth.users ALTER COLUMN id SET DEFAULT gen_random_uuid();
  END IF;

  -- Ensure NOT NULL remains set
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_attribute a
    JOIN pg_catalog.pg_class t ON a.attrelid = t.oid
    JOIN pg_catalog.pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'auth'
      AND t.relname = 'users'
      AND a.attname = 'id'
      AND a.attnotnull
  ) THEN
    ALTER TABLE auth.users ALTER COLUMN id SET NOT NULL;
  END IF;
END $$;


