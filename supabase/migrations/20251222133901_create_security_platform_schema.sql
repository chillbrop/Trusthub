/*
  # Security Orchestration Platform Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `avatar_url` (text)
      - `role` (text) - user role (admin, user, viewer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text) - project name
      - `description` (text) - project description
      - `repository_url` (text) - git repository URL
      - `owner_id` (uuid) - references profiles
      - `status` (text) - active, archived, etc
      - `risk_level` (text) - critical, high, medium, low
      - `last_scan_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `scanners`
      - `id` (uuid, primary key)
      - `name` (text) - scanner name
      - `type` (text) - SAST, DAST, SCA, Network, Container
      - `vendor` (text) - Checkmarx, Acunetix, etc
      - `api_url` (text) - scanner API endpoint
      - `api_key` (text) - encrypted API key
      - `status` (text) - active, inactive, error
      - `owner_id` (uuid) - references profiles
      - `last_connected_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `scans`
      - `id` (uuid, primary key)
      - `project_id` (uuid) - references projects
      - `scanner_id` (uuid) - references scanners
      - `scan_type` (text) - type of scan performed
      - `status` (text) - pending, running, completed, failed
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz)
      - `duration` (integer) - scan duration in seconds
      - `findings_count` (integer) - total vulnerabilities found
      - `critical_count` (integer)
      - `high_count` (integer)
      - `medium_count` (integer)
      - `low_count` (integer)
      - `created_at` (timestamptz)
    
    - `vulnerabilities`
      - `id` (uuid, primary key)
      - `scan_id` (uuid) - references scans
      - `project_id` (uuid) - references projects
      - `title` (text) - vulnerability title
      - `description` (text) - detailed description
      - `severity` (text) - critical, high, medium, low, info
      - `cve_id` (text) - CVE identifier if applicable
      - `cwe_id` (text) - CWE identifier if applicable
      - `file_path` (text) - affected file path
      - `line_number` (integer) - affected line number
      - `status` (text) - open, in_progress, resolved, false_positive
      - `resolution_notes` (text)
      - `resolved_at` (timestamptz)
      - `resolved_by` (uuid) - references profiles
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for viewing team/project data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role text DEFAULT 'user' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  repository_url text DEFAULT '',
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'active' NOT NULL,
  risk_level text DEFAULT 'low' NOT NULL,
  last_scan_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Create scanners table
CREATE TABLE IF NOT EXISTS scanners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  vendor text NOT NULL,
  api_url text DEFAULT '',
  api_key text DEFAULT '',
  status text DEFAULT 'inactive' NOT NULL,
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  last_connected_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE scanners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scanners"
  ON scanners FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own scanners"
  ON scanners FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own scanners"
  ON scanners FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete own scanners"
  ON scanners FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Create scans table
CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  scanner_id uuid REFERENCES scanners(id) ON DELETE CASCADE NOT NULL,
  scan_type text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  started_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz,
  duration integer DEFAULT 0,
  findings_count integer DEFAULT 0,
  critical_count integer DEFAULT 0,
  high_count integer DEFAULT 0,
  medium_count integer DEFAULT 0,
  low_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scans for own projects"
  ON scans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scans.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert scans for own projects"
  ON scans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update scans for own projects"
  ON scans FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scans.project_id
      AND projects.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete scans for own projects"
  ON scans FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scans.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Create vulnerabilities table
CREATE TABLE IF NOT EXISTS vulnerabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid REFERENCES scans(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  severity text NOT NULL,
  cve_id text DEFAULT '',
  cwe_id text DEFAULT '',
  file_path text DEFAULT '',
  line_number integer,
  status text DEFAULT 'open' NOT NULL,
  resolution_notes text DEFAULT '',
  resolved_at timestamptz,
  resolved_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view vulnerabilities for own projects"
  ON vulnerabilities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = vulnerabilities.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert vulnerabilities for own projects"
  ON vulnerabilities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update vulnerabilities for own projects"
  ON vulnerabilities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = vulnerabilities.project_id
      AND projects.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete vulnerabilities for own projects"
  ON vulnerabilities FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = vulnerabilities.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_scanners_owner_id ON scanners(owner_id);
CREATE INDEX IF NOT EXISTS idx_scans_project_id ON scans(project_id);
CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_project_id ON vulnerabilities(project_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_scan_id ON vulnerabilities(scan_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_status ON vulnerabilities(status);