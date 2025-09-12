-- Safe migration: ensure users.id has a UUID default and stays UUID type
-- Idempotent: uses IF EXISTS/IF NOT EXISTS checks and only sets default when missing

-- Ensure pgcrypto exists for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  -- Only set default if it's currently null
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'users'
      AND c.column_name = 'id'
      AND c.column_default IS NULL
  ) THEN
    ALTER TABLE public.users ALTER COLUMN id SET DEFAULT gen_random_uuid();
  END IF;

  -- Ensure NOT NULL constraint is present
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_attribute a
    JOIN pg_catalog.pg_class t ON a.attrelid = t.oid
    JOIN pg_catalog.pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'users'
      AND a.attname = 'id'
      AND a.attnotnull
  ) THEN
    ALTER TABLE public.users ALTER COLUMN id SET NOT NULL;
  END IF;
END $$;


