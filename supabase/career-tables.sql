-- Career Management Tables for LifeOS AI

-- Career Goals Table
CREATE TABLE IF NOT EXISTS career_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  role TEXT NOT NULL,
  application_status TEXT DEFAULT 'applied' CHECK (application_status IN ('applied', 'interviewing', 'offered', 'rejected', 'withdrawn')),
  applied_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skill Roadmap Table
CREATE TABLE IF NOT EXISTS skill_roadmap (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  category TEXT,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Progress Table
CREATE TABLE IF NOT EXISTS learning_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  platform TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_roadmap ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

-- Create Policies for Career Goals
CREATE POLICY "Users can view their own career goals" ON career_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own career goals" ON career_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own career goals" ON career_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own career goals" ON career_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Create Policies for Job Applications
CREATE POLICY "Users can view their own job applications" ON job_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job applications" ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job applications" ON job_applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job applications" ON job_applications
  FOR DELETE USING (auth.uid() = user_id);

-- Create Policies for Skill Roadmap
CREATE POLICY "Users can view their own skill roadmap" ON skill_roadmap
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skill roadmap" ON skill_roadmap
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skill roadmap" ON skill_roadmap
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skill roadmap" ON skill_roadmap
  FOR DELETE USING (auth.uid() = user_id);

-- Create Policies for Learning Progress
CREATE POLICY "Users can view their own learning progress" ON learning_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning progress" ON learning_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning progress" ON learning_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning progress" ON learning_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_career_goals_user_id ON career_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_roadmap_user_id ON skill_roadmap(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);

-- Enable Realtime for all tables
alter publication supabase_realtime add table career_goals;
alter publication supabase_realtime add table job_applications;
alter publication supabase_realtime add table skill_roadmap;
alter publication supabase_realtime add table learning_progress;
