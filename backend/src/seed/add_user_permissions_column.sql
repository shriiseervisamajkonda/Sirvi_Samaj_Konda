-- Migration: Add per-user permissions column to users table
-- This enables granular authority management (e.g., can_export_data)
-- Run this in Supabase SQL Editor

-- Add permissions JSONB column to users table (per-user granular permissions)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;

-- Add a comment for documentation
COMMENT ON COLUMN users.permissions IS 'Per-user granular permissions array (e.g., ["can_export_data"]). Separate from role-level permissions.';

-- Grant can_export_data to all existing developer and super_admin users by default
-- (They already bypass via authorize() middleware, but this makes it explicit in the DB)
UPDATE users
SET permissions = '["can_export_data"]'::jsonb
WHERE role IN ('developer', 'super_admin')
  AND (permissions IS NULL OR permissions = '[]'::jsonb);
