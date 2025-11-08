-- Migration: Update admin references to use RMIS_ID instead of UUID
-- This migration changes reviewed_by fields from profiles(id) to admin_users(rmis_id)
-- First, create the admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
    rmis_id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT,
    role admin_role DEFAULT 'moderator',
    district TEXT DEFAULT 'RID 3220',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_rmis_id CHECK (rmis_id ~ '^[A-Z0-9]+$')
);
-- Update jobs table: change reviewed_by from UUID to TEXT
-- First drop the existing foreign key constraint
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_reviewed_by_fkey;
-- Change the column type
ALTER TABLE jobs
ALTER COLUMN reviewed_by TYPE TEXT;
-- Add new foreign key constraint
ALTER TABLE jobs
ADD CONSTRAINT jobs_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES admin_users(rmis_id);
-- Update companies table: change reviewed_by from UUID to TEXT
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_reviewed_by_fkey;
ALTER TABLE companies
ALTER COLUMN reviewed_by TYPE TEXT;
ALTER TABLE companies
ADD CONSTRAINT companies_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES admin_users(rmis_id);
-- Update verification_attempts table: change reviewed_by from UUID to TEXT
ALTER TABLE verification_attempts DROP CONSTRAINT IF EXISTS verification_attempts_reviewed_by_fkey;
ALTER TABLE verification_attempts
ALTER COLUMN reviewed_by TYPE TEXT;
ALTER TABLE verification_attempts
ADD CONSTRAINT verification_attempts_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES admin_users(rmis_id);
-- Note: Existing data in reviewed_by columns will be set to NULL
-- This is expected since we're changing the reference system