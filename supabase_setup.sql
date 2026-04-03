-- =============================================================
-- OSIRIS OSINT Platform — Supabase Complete SQL Setup
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES (extends auth.users)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'client'
              CHECK (role IN ('admin', 'manager', 'investigator', 'client')),
  is_active   BOOLEAN DEFAULT TRUE,
  avatar_url  TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- 2. CLIENTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name    TEXT NOT NULL,
  email        TEXT UNIQUE,
  phone        TEXT,
  company_name TEXT,
  address      TEXT,
  status       TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 3. INVESTIGATORS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investigators (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name      TEXT NOT NULL,
  email          TEXT UNIQUE NOT NULL,
  phone          TEXT,
  specialization TEXT,
  status         TEXT DEFAULT 'active',
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 4. CASES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cases (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES investigators(id) ON DELETE SET NULL,
  managed_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  priority    TEXT DEFAULT 'medium'
              CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status      TEXT DEFAULT 'open'
              CHECK (status IN ('open', 'in_progress', 'on_hold', 'closed', 'cancelled')),
  due_date    DATE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- auto-update updated_at on cases
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cases_updated_at ON cases;
CREATE TRIGGER cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 5. SUBJECTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id           UUID REFERENCES cases(id) ON DELETE CASCADE,
  full_name         TEXT NOT NULL,
  date_of_birth     DATE,
  gender            TEXT,
  nationality       TEXT,
  national_id       TEXT,
  passport_number   TEXT,
  phone             TEXT,
  email             TEXT,
  current_address   TEXT,
  permanent_address TEXT,
  occupation        TEXT,
  employer          TEXT,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 6. OSINT FINDINGS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS osint_findings (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id               UUID REFERENCES cases(id) ON DELETE CASCADE,
  subject_id            UUID REFERENCES subjects(id) ON DELETE CASCADE,
  investigator_id       UUID REFERENCES profiles(id),
  source_type           TEXT CHECK (source_type IN (
                          'social_media', 'public_record', 'news', 'court_record',
                          'employment', 'financial', 'criminal', 'address', 'other')),
  source_name           TEXT,
  source_url            TEXT,
  finding_summary       TEXT NOT NULL,
  risk_level            TEXT DEFAULT 'none'
                        CHECK (risk_level IN ('none', 'low', 'medium', 'high', 'critical')),
  verified              BOOLEAN DEFAULT FALSE,
  is_visible_to_client  BOOLEAN DEFAULT FALSE,
  found_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 7. EVIDENCE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evidence (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id     UUID REFERENCES cases(id) ON DELETE CASCADE,
  finding_id  UUID REFERENCES osint_findings(id) ON DELETE SET NULL,
  file_name   TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  file_type   TEXT,
  description TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 8. REPORTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id             UUID REFERENCES cases(id) ON DELETE CASCADE,
  generated_by        UUID REFERENCES profiles(id),
  approved_by         UUID REFERENCES profiles(id),
  report_title        TEXT NOT NULL,
  executive_summary   TEXT,
  overall_risk        TEXT DEFAULT 'none'
                      CHECK (overall_risk IN ('none', 'low', 'medium', 'high', 'critical')),
  conclusion          TEXT,
  status              TEXT DEFAULT 'draft'
                      CHECK (status IN ('draft', 'review', 'final', 'delivered')),
  is_visible_to_client BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS reports_updated_at ON reports;
CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 9. CASE ACTIVITY LOG
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_activity (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id      UUID REFERENCES cases(id) ON DELETE CASCADE,
  performed_by UUID REFERENCES profiles(id),
  action       TEXT NOT NULL,
  note         TEXT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 10. AUDIT LOG (admin only)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  performed_by UUID REFERENCES profiles(id),
  action       TEXT NOT NULL,
  table_name   TEXT,
  record_id    UUID,
  old_value    JSONB,
  new_value    JSONB,
  ip_address   TEXT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_profiles"   ON profiles;
DROP POLICY IF EXISTS "own_profile_select"   ON profiles;
DROP POLICY IF EXISTS "own_profile_update"   ON profiles;

CREATE POLICY "admin_all_profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "own_profile_select" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "own_profile_update" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- CLIENTS
-- ─────────────────────────────────────────────────────────────
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_manager_all_clients" ON clients;
DROP POLICY IF EXISTS "client_own_client_row"      ON clients;

CREATE POLICY "admin_manager_all_clients" ON clients
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager'))
  );

-- Investigators: read-only access to clients
CREATE POLICY "investigator_read_clients" ON clients
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'investigator')
  );

-- Clients: see their own client row
CREATE POLICY "client_own_client_row" ON clients
  FOR SELECT USING (profile_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- INVESTIGATORS
-- ─────────────────────────────────────────────────────────────
ALTER TABLE investigators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_manager_all_investigators" ON investigators;
DROP POLICY IF EXISTS "investigator_own_row"            ON investigators;

CREATE POLICY "admin_manager_all_investigators" ON investigators
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager'))
  );

CREATE POLICY "investigator_own_row" ON investigators
  FOR SELECT USING (profile_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- CASES
-- ─────────────────────────────────────────────────────────────
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_manager_all_cases"      ON cases;
DROP POLICY IF EXISTS "investigator_assigned_cases"  ON cases;
DROP POLICY IF EXISTS "client_own_cases"             ON cases;

CREATE POLICY "admin_manager_all_cases" ON cases
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager'))
  );

CREATE POLICY "investigator_assigned_cases" ON cases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM investigators i
      WHERE i.profile_id = auth.uid() AND i.id = cases.assigned_to
    )
  );

CREATE POLICY "client_own_cases" ON cases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.profile_id = auth.uid() AND c.id = cases.client_id
    )
  );

-- ─────────────────────────────────────────────────────────────
-- SUBJECTS
-- ─────────────────────────────────────────────────────────────
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_all_subjects" ON subjects;

CREATE POLICY "staff_all_subjects" ON subjects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager', 'investigator'))
  );

-- ─────────────────────────────────────────────────────────────
-- OSINT FINDINGS (clients NEVER see raw findings)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE osint_findings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_all_findings" ON osint_findings;

CREATE POLICY "staff_all_findings" ON osint_findings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager', 'investigator'))
  );

-- ─────────────────────────────────────────────────────────────
-- EVIDENCE
-- ─────────────────────────────────────────────────────────────
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_all_evidence" ON evidence;

CREATE POLICY "staff_all_evidence" ON evidence
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager', 'investigator'))
  );

-- ─────────────────────────────────────────────────────────────
-- REPORTS
-- ─────────────────────────────────────────────────────────────
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_manager_all_reports"  ON reports;
DROP POLICY IF EXISTS "investigator_own_reports"   ON reports;
DROP POLICY IF EXISTS "client_visible_reports"     ON reports;

CREATE POLICY "admin_manager_all_reports" ON reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager'))
  );

CREATE POLICY "investigator_own_reports" ON reports
  FOR ALL USING (generated_by = auth.uid());

CREATE POLICY "client_visible_reports" ON reports
  FOR SELECT USING (
    is_visible_to_client = TRUE
    AND status = 'delivered'
    AND EXISTS (
      SELECT 1 FROM cases c
      JOIN clients cl ON cl.id = c.client_id
      WHERE c.id = reports.case_id AND cl.profile_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- CASE ACTIVITY
-- ─────────────────────────────────────────────────────────────
ALTER TABLE case_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_manager_all_activity"     ON case_activity;
DROP POLICY IF EXISTS "investigator_case_activity"     ON case_activity;

CREATE POLICY "admin_manager_all_activity" ON case_activity
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager'))
  );

CREATE POLICY "investigator_case_activity" ON case_activity
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM investigators i
      JOIN cases c ON c.assigned_to = i.id
      WHERE i.profile_id = auth.uid() AND c.id = case_activity.case_id
    )
  );

-- ─────────────────────────────────────────────────────────────
-- AUDIT LOG (admin read/write only)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_audit"    ON audit_log;
DROP POLICY IF EXISTS "any_insert_audit"   ON audit_log;

CREATE POLICY "admin_all_audit" ON audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Any authenticated user can write to audit_log (fire-and-forget)
CREATE POLICY "any_insert_audit" ON audit_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================
-- STORAGE — Evidence Bucket
-- =============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence',
  'evidence',
  false,
  52428800,
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'video/mp4', 'video/webm',
    'audio/mpeg', 'audio/wav'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "staff_upload_evidence" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'evidence'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'manager', 'investigator')
        AND is_active = true
    )
  );

CREATE POLICY "staff_view_evidence" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'evidence'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'manager', 'investigator')
    )
  );

CREATE POLICY "admin_delete_evidence" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'evidence'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================================
-- DONE — All tables, triggers, RLS, and storage are set up.
-- Next steps:
--   1. Add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to .env
--   2. Create your first admin user via Supabase Auth dashboard
--   3. Set that user's role to 'admin' in the profiles table
--   4. Run: npm run dev
-- =============================================================
