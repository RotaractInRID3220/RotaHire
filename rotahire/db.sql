-- =============================================
-- ROTAHIRE DATABASE SCHEMA FOR SUPABASE
-- =============================================
-- 
-- This schema is optimized for Supabase PostgreSQL with:
-- - Idempotent operations (CREATE IF NOT EXISTS, DROP IF EXISTS)
-- - Row Level Security (RLS) enabled on all tables
-- - Full CRUD access granted to anon and authenticated roles
-- - Public schema permissions for development
--
-- ⚠️  SECURITY WARNING: This configuration grants full access to all users.
--     For production, replace the RLS policies with proper access controls.
--
-- =============================================
-- ENUMS (Predefined Categories)
-- =============================================
DO $$ BEGIN CREATE TYPE job_field AS ENUM (
    'software_engineering',
    'data_science',
    'design',
    'marketing',
    'sales',
    'finance',
    'human_resources',
    'operations',
    'consulting',
    'healthcare',
    'education',
    'engineering',
    'legal',
    'customer_support',
    'content_writing',
    'other'
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE job_mode AS ENUM ('remote', 'hybrid', 'onsite');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE experience_level AS ENUM (
    'internship',
    'entry_level',
    -- 0-2 years
    'mid_level',
    -- 2-5 years
    'senior_level',
    -- 5+ years
    'lead_level',
    -- 8+ years
    'executive' -- C-level
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE job_status AS ENUM (
    'draft',
    'pending_approval',
    'approved',
    'rejected',
    'active',
    'closed',
    'expired'
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE application_status AS ENUM (
    'submitted',
    'under_review',
    'shortlisted',
    'interview_scheduled',
    'rejected',
    'hired',
    'withdrawn'
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE company_status AS ENUM (
    'pending_approval',
    'approved',
    'rejected',
    'suspended',
    'active'
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE verification_status AS ENUM (
    'pending',
    'verified',
    'flagged',
    'rejected'
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE admin_role AS ENUM (
    'super_admin',
    'district_admin',
    'moderator'
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE company_tier AS ENUM (
    'basic',
    -- Can only post jobs with external links
    'premium' -- Can receive CVs, analytics, etc.
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- =============================================
-- CORE TABLES
-- =============================================
-- Rotaract Clubs in RID 3220
CREATE TABLE IF NOT EXISTS rotaract_clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_name TEXT NOT NULL,
    club_code TEXT UNIQUE,
    country TEXT NOT NULL,
    -- 'Sri Lanka' or 'Maldives'
    city TEXT,
    established_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- User Profiles (Rotaractors)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    rmis_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    -- Personal Info
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    nic TEXT,
    -- National Identity Card (for verification)
    mobile TEXT,
    profile_photo_url TEXT,
    -- Professional Info
    current_position TEXT,
    bio TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    -- Rotaract Info
    club_id UUID REFERENCES rotaract_clubs(id),
    is_club_verified BOOLEAN DEFAULT false,
    verification_status verification_status DEFAULT 'pending',
    verification_notes TEXT,
    -- System
    profile_completeness_score INTEGER DEFAULT 0,
    -- 0-100
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Constraints
    CONSTRAINT valid_linkedin CHECK (
        linkedin_url IS NULL
        OR linkedin_url ~* '^https?://(www\.)?linkedin\.com/'
    ),
    CONSTRAINT valid_github CHECK (
        github_url IS NULL
        OR github_url ~* '^https?://(www\.)?github\.com/'
    )
);
-- Verification Attempts (for flagged applications)
CREATE TABLE IF NOT EXISTS verification_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Submitted Data
    submitted_rmis_id TEXT NOT NULL,
    submitted_nic TEXT NOT NULL,
    submitted_last_name TEXT NOT NULL,
    -- API Response
    api_rmis_id TEXT,
    api_nic TEXT,
    api_last_name TEXT,
    -- Verification Result
    nic_matches BOOLEAN,
    last_name_matches BOOLEAN,
    is_flagged BOOLEAN DEFAULT false,
    -- Admin Review
    verification_status verification_status DEFAULT 'pending',
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    -- Metadata
    user_id UUID REFERENCES profiles(id),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- CVs (Metadata only, files in Firebase Storage)
CREATE TABLE IF NOT EXISTS cvs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rmis_id TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    -- File Info
    firebase_storage_path TEXT NOT NULL,
    -- Format: cvs/{rmis_id}_{timestamp}.pdf
    original_filename TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    mime_type TEXT DEFAULT 'application/pdf',
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    upload_count INTEGER DEFAULT 1,
    -- Track how many times this RMIS ID uploaded
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Constraints
    CONSTRAINT valid_file_size CHECK (file_size_bytes <= 2097152) -- 2MB max
);
-- Companies
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Company Info
    company_name TEXT NOT NULL,
    company_email TEXT UNIQUE NOT NULL,
    company_website TEXT,
    company_logo_url TEXT,
    industry TEXT,
    company_size TEXT,
    -- '1-10', '11-50', '51-200', '201-500', '500+'
    description TEXT,
    -- Contact Person
    contact_person_name TEXT NOT NULL,
    contact_person_email TEXT NOT NULL,
    contact_person_mobile TEXT,
    contact_person_designation TEXT,
    -- Location
    country TEXT NOT NULL,
    city TEXT,
    address TEXT,
    -- Account Info
    tier company_tier DEFAULT 'basic',
    status company_status DEFAULT 'pending_approval',
    -- Admin Review
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    -- System
    is_verified BOOLEAN DEFAULT false,
    -- Badge after approval
    signup_ip_address TEXT,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Company Team Members (Multiple users per company)
CREATE TABLE IF NOT EXISTS company_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    -- 'owner', 'admin', 'member'
    can_post_jobs BOOLEAN DEFAULT true,
    can_view_applications BOOLEAN DEFAULT true,
    can_manage_team BOOLEAN DEFAULT false,
    invited_by UUID REFERENCES auth.users(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, user_id)
);
-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    -- Job Details
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    responsibilities TEXT,
    requirements TEXT,
    -- Categories
    field job_field NOT NULL,
    mode job_mode NOT NULL,
    experience_level experience_level NOT NULL,
    -- Location
    location TEXT,
    -- For onsite/hybrid
    country TEXT,
    city TEXT,
    -- Compensation (Optional)
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency TEXT DEFAULT 'LKR',
    is_salary_disclosed BOOLEAN DEFAULT false,
    -- Application Method
    accepts_direct_applications BOOLEAN DEFAULT true,
    -- CVs via system
    external_application_url TEXT,
    -- If company uses own form
    requires_github BOOLEAN DEFAULT false,
    requires_linkedin BOOLEAN DEFAULT false,
    -- Status
    status job_status DEFAULT 'draft',
    is_active BOOLEAN DEFAULT false,
    -- Admin Review
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    -- Metadata
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    posted_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    -- Auto-close after 90 days
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Constraints
    CONSTRAINT valid_salary CHECK (
        salary_min IS NULL
        OR salary_max IS NULL
        OR salary_min <= salary_max
    ),
    CONSTRAINT has_application_method CHECK (
        accepts_direct_applications = true
        OR external_application_url IS NOT NULL
    )
);
-- Job Skills (Many-to-Many)
CREATE TABLE IF NOT EXISTS job_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, skill_name)
);
-- Applications
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    -- Quick Apply Data
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    applicant_mobile TEXT,
    applicant_rmis_id TEXT NOT NULL,
    applicant_linkedin_url TEXT,
    applicant_github_url TEXT,
    -- If required
    -- CV Reference
    cv_id UUID REFERENCES cvs(id),
    cv_snapshot_path TEXT,
    -- Copy of CV at time of application
    -- Cover Letter / Message
    cover_letter TEXT,
    -- Status Tracking
    status application_status DEFAULT 'submitted',
    is_shortlisted BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    -- Company's favorite tag
    -- Company Actions
    company_notes TEXT,
    -- Private notes by company
    viewed_at TIMESTAMP WITH TIME ZONE,
    shortlisted_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    -- Interview Scheduling
    interview_scheduled_at TIMESTAMP WITH TIME ZONE,
    interview_link TEXT,
    -- Calendly/Google Meet link
    interview_notes TEXT,
    -- Metadata
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Constraints
    UNIQUE(job_id, user_id) -- One application per user per job
);
-- Saved Jobs (Bookmarks)
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);
-- Email Subscriptions
CREATE TABLE IF NOT EXISTS email_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    -- Subscription Preferences
    weekly_job_digest BOOLEAN DEFAULT true,
    application_updates BOOLEAN DEFAULT true,
    interview_reminders BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    -- Metadata
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Company Email Subscriptions
CREATE TABLE IF NOT EXISTS company_email_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    -- Subscription Preferences
    weekly_open_jobs_summary BOOLEAN DEFAULT true,
    new_application_alerts BOOLEAN DEFAULT true,
    job_approval_notifications BOOLEAN DEFAULT true,
    platform_updates BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    -- Notification Content
    type TEXT NOT NULL,
    -- 'application_status', 'interview_scheduled', 'job_match', etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Admin Users (District Team)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    -- Admin Info
    role admin_role NOT NULL,
    permissions JSONB DEFAULT '{}',
    -- Flexible permissions
    -- Assigned By
    assigned_by UUID REFERENCES admin_users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Admin Action Logs (Audit Trail)
CREATE TABLE IF NOT EXISTS admin_action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id),
    -- Action Details
    action_type TEXT NOT NULL,
    -- 'approve_company', 'reject_job', 'verify_user', etc.
    entity_type TEXT NOT NULL,
    -- 'company', 'job', 'user', 'application'
    entity_id UUID NOT NULL,
    -- Details
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    -- Metadata
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Event Info
    event_type TEXT NOT NULL,
    -- 'job_view', 'job_apply', 'profile_view', etc.
    user_id UUID REFERENCES profiles(id) ON DELETE
    SET NULL,
        company_id UUID REFERENCES companies(id) ON DELETE
    SET NULL,
        job_id UUID REFERENCES jobs(id) ON DELETE
    SET NULL,
        -- Event Data
        metadata JSONB DEFAULT '{}',
        -- Session Info
        session_id TEXT,
        ip_address TEXT,
        user_agent TEXT,
        referrer TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Job Views (Separate for better query performance)
CREATE TABLE IF NOT EXISTS job_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE
    SET NULL,
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        -- View Info
        viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        session_id TEXT,
        ip_address TEXT
);
-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_rmis_id ON profiles(rmis_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_club_id ON profiles(club_id);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);
-- CVs
CREATE INDEX IF NOT EXISTS idx_cvs_rmis_id ON cvs(rmis_id);
CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_cvs_is_active ON cvs(is_active);
-- Companies
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(company_email);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at);
-- Jobs
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_field ON jobs(field);
CREATE INDEX IF NOT EXISTS idx_jobs_mode ON jobs(mode);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_expires_at ON jobs(expires_at);
-- Applications
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_is_shortlisted ON applications(is_shortlisted);
CREATE INDEX IF NOT EXISTS idx_applications_is_favorite ON applications(is_favorite);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON applications(applied_at DESC);
-- Verification Attempts
CREATE INDEX IF NOT EXISTS idx_verification_attempts_status ON verification_attempts(verification_status);
CREATE INDEX IF NOT EXISTS idx_verification_attempts_flagged ON verification_attempts(is_flagged);
CREATE INDEX IF NOT EXISTS idx_verification_attempts_created_at ON verification_attempts(created_at DESC);
-- Analytics
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_views_job_id ON job_views(job_id);
CREATE INDEX IF NOT EXISTS idx_job_views_viewed_at ON job_views(viewed_at DESC);
-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================
-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Apply to all tables with updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_cvs_updated_at ON cvs;
CREATE TRIGGER update_cvs_updated_at BEFORE
UPDATE ON cvs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE
UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at BEFORE
UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at BEFORE
UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Increment job views count
CREATE OR REPLACE FUNCTION increment_job_views() RETURNS TRIGGER AS $$ BEGIN
UPDATE jobs
SET views_count = views_count + 1
WHERE id = NEW.job_id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_job_views_count ON job_views;
CREATE TRIGGER update_job_views_count
AFTER
INSERT ON job_views FOR EACH ROW EXECUTE FUNCTION increment_job_views();
-- Increment job applications count
CREATE OR REPLACE FUNCTION increment_job_applications() RETURNS TRIGGER AS $$ BEGIN
UPDATE jobs
SET applications_count = applications_count + 1
WHERE id = NEW.job_id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_job_applications_count ON applications;
CREATE TRIGGER update_job_applications_count
AFTER
INSERT ON applications FOR EACH ROW EXECUTE FUNCTION increment_job_applications();
-- Calculate profile completeness score
CREATE OR REPLACE FUNCTION calculate_profile_completeness() RETURNS TRIGGER AS $$
DECLARE score INTEGER := 0;
BEGIN -- Basic info (40 points)
IF NEW.first_name IS NOT NULL
AND NEW.first_name != '' THEN score := score + 10;
END IF;
IF NEW.last_name IS NOT NULL
AND NEW.last_name != '' THEN score := score + 10;
END IF;
IF NEW.email IS NOT NULL THEN score := score + 10;
END IF;
IF NEW.mobile IS NOT NULL
AND NEW.mobile != '' THEN score := score + 10;
END IF;
-- Professional info (30 points)
IF NEW.current_position IS NOT NULL
AND NEW.current_position != '' THEN score := score + 10;
END IF;
IF NEW.bio IS NOT NULL
AND NEW.bio != '' THEN score := score + 10;
END IF;
IF NEW.linkedin_url IS NOT NULL
AND NEW.linkedin_url != '' THEN score := score + 10;
END IF;
-- Additional (30 points)
IF NEW.profile_photo_url IS NOT NULL
AND NEW.profile_photo_url != '' THEN score := score + 10;
END IF;
IF NEW.github_url IS NOT NULL
AND NEW.github_url != '' THEN score := score + 10;
END IF;
IF NEW.portfolio_url IS NOT NULL
AND NEW.portfolio_url != '' THEN score := score + 10;
END IF;
NEW.profile_completeness_score := score;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_profile_completeness ON profiles;
CREATE TRIGGER update_profile_completeness BEFORE
INSERT
    OR
UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION calculate_profile_completeness();
-- Auto-expire jobs after 90 days
CREATE OR REPLACE FUNCTION auto_expire_jobs() RETURNS void AS $$ BEGIN
UPDATE jobs
SET status = 'expired',
    is_active = false
WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================
-- Enable RLS on all tables
ALTER TABLE rotaract_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_views ENABLE ROW LEVEL SECURITY;
-- =============================================
-- GRANT PUBLIC ACCESS TO ALL TABLES
-- =============================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
-- =============================================
-- RLS POLICIES - FULL ACCESS FOR ANON & AUTHENTICATED
-- =============================================
-- Rotaract Clubs
DROP POLICY IF EXISTS "anon_all_rotaract_clubs" ON rotaract_clubs;
CREATE POLICY "anon_all_rotaract_clubs" ON rotaract_clubs FOR ALL USING (true) WITH CHECK (true);
-- Profiles
DROP POLICY IF EXISTS "anon_all_profiles" ON profiles;
CREATE POLICY "anon_all_profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
-- Verification Attempts
DROP POLICY IF EXISTS "anon_all_verification_attempts" ON verification_attempts;
CREATE POLICY "anon_all_verification_attempts" ON verification_attempts FOR ALL USING (true) WITH CHECK (true);
-- CVs
DROP POLICY IF EXISTS "anon_all_cvs" ON cvs;
CREATE POLICY "anon_all_cvs" ON cvs FOR ALL USING (true) WITH CHECK (true);
-- Companies
DROP POLICY IF EXISTS "anon_all_companies" ON companies;
CREATE POLICY "anon_all_companies" ON companies FOR ALL USING (true) WITH CHECK (true);
-- Company Members
DROP POLICY IF EXISTS "anon_all_company_members" ON company_members;
CREATE POLICY "anon_all_company_members" ON company_members FOR ALL USING (true) WITH CHECK (true);
-- Jobs
DROP POLICY IF EXISTS "anon_all_jobs" ON jobs;
CREATE POLICY "anon_all_jobs" ON jobs FOR ALL USING (true) WITH CHECK (true);
-- Job Skills
DROP POLICY IF EXISTS "anon_all_job_skills" ON job_skills;
CREATE POLICY "anon_all_job_skills" ON job_skills FOR ALL USING (true) WITH CHECK (true);
-- Applications
DROP POLICY IF EXISTS "anon_all_applications" ON applications;
CREATE POLICY "anon_all_applications" ON applications FOR ALL USING (true) WITH CHECK (true);
-- Saved Jobs
DROP POLICY IF EXISTS "anon_all_saved_jobs" ON saved_jobs;
CREATE POLICY "anon_all_saved_jobs" ON saved_jobs FOR ALL USING (true) WITH CHECK (true);
-- Email Subscriptions
DROP POLICY IF EXISTS "anon_all_email_subscriptions" ON email_subscriptions;
CREATE POLICY "anon_all_email_subscriptions" ON email_subscriptions FOR ALL USING (true) WITH CHECK (true);
-- Company Email Subscriptions
DROP POLICY IF EXISTS "anon_all_company_email_subscriptions" ON company_email_subscriptions;
CREATE POLICY "anon_all_company_email_subscriptions" ON company_email_subscriptions FOR ALL USING (true) WITH CHECK (true);
-- Notifications
DROP POLICY IF EXISTS "anon_all_notifications" ON notifications;
CREATE POLICY "anon_all_notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
-- Admin Users
DROP POLICY IF EXISTS "anon_all_admin_users" ON admin_users;
CREATE POLICY "anon_all_admin_users" ON admin_users FOR ALL USING (true) WITH CHECK (true);
-- Admin Action Logs
DROP POLICY IF EXISTS "anon_all_admin_action_logs" ON admin_action_logs;
CREATE POLICY "anon_all_admin_action_logs" ON admin_action_logs FOR ALL USING (true) WITH CHECK (true);
-- Analytics Events
DROP POLICY IF EXISTS "anon_all_analytics_events" ON analytics_events;
CREATE POLICY "anon_all_analytics_events" ON analytics_events FOR ALL USING (true) WITH CHECK (true);
-- Job Views
DROP POLICY IF EXISTS "anon_all_job_views" ON job_views;
CREATE POLICY "anon_all_job_views" ON job_views FOR ALL USING (true) WITH CHECK (true);
-- =============================================
-- SEED DATA
-- =============================================
-- Insert some Rotaract clubs
INSERT INTO rotaract_clubs (club_name, club_code, country, city, is_active)
VALUES (
        'Rotaract Club of Colombo',
        'RC-COL-001',
        'Sri Lanka',
        'Colombo',
        true
    ),
    (
        'Rotaract Club of Kandy',
        'RC-KAN-001',
        'Sri Lanka',
        'Kandy',
        true
    ),
    (
        'Rotaract Club of Galle',
        'RC-GAL-001',
        'Sri Lanka',
        'Galle',
        true
    ),
    (
        'Rotaract Club of Malé',
        'RC-MAL-001',
        'Maldives',
        'Malé',
        true
    ) ON CONFLICT (club_code) DO NOTHING;
```

## 📊 Key Design Decisions Explained

### 1. **CV Management with RMIS ID**
- CVs stored in Firebase with path: ` cvs / { rmis_id } _ { timestamp }.pdf `
- System checks for existing CVs by RMIS ID before upload
- Max 2 active CVs per user (enforced by unique constraint)
- When applying, users see existing CVs for their RMIS ID and can reuse or upload new

### 2. **Verification Flow**
``` User applies → System queries API with (RMIS_ID, NIC, Last Name) → If mismatch → Create verification_attempt record with is_flagged = true → Send email to district admins → Admin reviews in portal → Approve / Reject