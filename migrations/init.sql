-- LifeOS AI Database Schema
-- Run this in Supabase SQL Editor to set up the complete database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. GOALS TABLE
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('yearly', 'monthly', 'weekly')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'paused')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. GOAL MILESTONES TABLE
CREATE TABLE IF NOT EXISTS goal_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  completed_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. HABITS TABLE
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  target_count INTEGER DEFAULT 1,
  category VARCHAR(100),
  color VARCHAR(10) DEFAULT '#00d4ff',
  start_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. HABIT LOGS TABLE
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  category_id UUID REFERENCES expense_categories(id),
  description VARCHAR(255),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. EXPENSE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  monthly_budget DECIMAL(10, 2),
  color VARCHAR(10) DEFAULT '#00ff88',
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. STUDY SESSIONS TABLE
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  duration_minutes INTEGER,
  date DATE NOT NULL,
  deadline DATE,
  notes TEXT,
  completion_status VARCHAR(50) DEFAULT 'pending' CHECK (completion_status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. PRODUCTIVITY ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS productivity_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  goals_completed INTEGER DEFAULT 0,
  goals_attempted INTEGER DEFAULT 0,
  habits_completed INTEGER DEFAULT 0,
  habits_targeted INTEGER DEFAULT 0,
  study_hours DECIMAL(5, 2) DEFAULT 0,
  focus_score INTEGER DEFAULT 0,
  streak_data JSONB,
  mood_rating INTEGER,
  energy_level INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- 9. AI INSIGHTS TABLE
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('recommendation', 'burnout_alert', 'prediction', 'analysis', 'insight')),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  actionable_items JSONB,
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  avatar_url VARCHAR(500),
  bio TEXT,
  timezone VARCHAR(100) DEFAULT 'UTC',
  theme VARCHAR(50) DEFAULT 'dark',
  notifications_enabled BOOLEAN DEFAULT true,
  ai_analysis_frequency VARCHAR(50) DEFAULT 'daily',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CREATE INDEXES
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goal_milestones_goal_id ON goal_milestones(goal_id);
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_date ON habit_logs(logged_date);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_productivity_analytics_user_id ON productivity_analytics(user_id);
CREATE INDEX idx_productivity_analytics_date ON productivity_analytics(date);
CREATE INDEX idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX idx_ai_insights_created ON ai_insights(created_at);

-- ROW LEVEL SECURITY POLICIES
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES: Goals
CREATE POLICY goals_auth_policy ON goals
  FOR ALL USING (auth.uid() = user_id);

-- RLS POLICIES: Goal Milestones (check via goal)
CREATE POLICY goal_milestones_auth_policy ON goal_milestones
  FOR ALL USING (goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid()));

-- RLS POLICIES: Habits
CREATE POLICY habits_auth_policy ON habits
  FOR ALL USING (auth.uid() = user_id);

-- RLS POLICIES: Habit Logs (check via habit)
CREATE POLICY habit_logs_auth_policy ON habit_logs
  FOR ALL USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

-- RLS POLICIES: Expenses
CREATE POLICY expenses_auth_policy ON expenses
  FOR ALL USING (auth.uid() = user_id);

-- RLS POLICIES: Expense Categories
CREATE POLICY expense_categories_auth_policy ON expense_categories
  FOR ALL USING (auth.uid() = user_id);

-- RLS POLICIES: Study Sessions
CREATE POLICY study_sessions_auth_policy ON study_sessions
  FOR ALL USING (auth.uid() = user_id);

-- RLS POLICIES: Productivity Analytics
CREATE POLICY productivity_analytics_auth_policy ON productivity_analytics
  FOR ALL USING (auth.uid() = user_id);

-- RLS POLICIES: AI Insights
CREATE POLICY ai_insights_auth_policy ON ai_insights
  FOR ALL USING (auth.uid() = user_id);

-- 11. HEALTH LOGS TABLE
CREATE TABLE IF NOT EXISTS health_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sleep_hours DECIMAL(4,2),
  water_intake_liters DECIMAL(4,2),
  mood VARCHAR(50) CHECK (mood IN ('excellent', 'good', 'neutral', 'stressed', 'tired')),
  steps INTEGER,
  workout_completed BOOLEAN DEFAULT false,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CREATE INDEXES
CREATE INDEX idx_health_logs_user_id ON health_logs(user_id);
CREATE INDEX idx_health_logs_date ON health_logs(log_date);

-- ROW LEVEL SECURITY POLICIES
ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES: Health Logs
CREATE POLICY health_logs_auth_policy ON health_logs
  FOR ALL USING (auth.uid() = user_id);

-- RLS POLICIES: User Profiles
CREATE POLICY user_profiles_auth_policy ON user_profiles
  FOR ALL USING (auth.uid() = id);
