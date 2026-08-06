-- Bug Tracker Migration
-- Adds tester role, bugs table, and bug_comments table

-- 1. Update the role check constraint to include 'tester'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'professor', 'admin', 'tester'));

-- 2. Create bugs table
CREATE TABLE IF NOT EXISTS public.bugs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  screenshots text[] DEFAULT '{}',
  reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_to text DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Create bug_comments table
CREATE TABLE IF NOT EXISTS public.bug_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bug_id uuid NOT NULL REFERENCES public.bugs(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  message text NOT NULL,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_bugs_reporter ON public.bugs(reporter_id);
CREATE INDEX IF NOT EXISTS idx_bugs_status ON public.bugs(status);
CREATE INDEX IF NOT EXISTS idx_bug_comments_bug ON public.bug_comments(bug_id);

-- 5. RLS policies
ALTER TABLE public.bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_comments ENABLE ROW LEVEL SECURITY;

-- Testers and admins can read all bugs
CREATE POLICY bugs_select ON public.bugs FOR SELECT
  USING (true);

-- Testers and admins can insert bugs
CREATE POLICY bugs_insert ON public.bugs FOR INSERT
  WITH CHECK (true);

-- Testers can update their own bugs, admins can update any
CREATE POLICY bugs_update ON public.bugs FOR UPDATE
  USING (true);

-- Comments: everyone can read
CREATE POLICY bug_comments_select ON public.bug_comments FOR SELECT
  USING (true);

-- Comments: anyone can insert
CREATE POLICY bug_comments_insert ON public.bug_comments FOR INSERT
  WITH CHECK (true);
