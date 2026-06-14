-- ============================================================================
-- Compatibility shim for plain PostgreSQL (no Supabase).
--
-- The migration files in supabase/migrations/* were authored for Supabase and
-- reference `auth.role()` inside their RLS policies. On a vanilla Postgres
-- server that function does not exist, so the migrations would fail to load.
--
-- This file runs FIRST (docker-entrypoint-initdb.d sorts by filename) and
-- defines a no-op `auth` schema so the original migrations run verbatim.
--
-- Note: the application connects as the database OWNER, which bypasses RLS
-- entirely, so these policies are inert here — access control is enforced in
-- the Next.js middleware and server actions instead.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.role() RETURNS text
  LANGUAGE sql STABLE
  AS $$ SELECT 'service_role'::text $$;

CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
  LANGUAGE sql STABLE
  AS $$ SELECT NULL::uuid $$;
