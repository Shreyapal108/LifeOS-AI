-- Add new fields to study_sessions table for enhanced study planner

-- Add new columns if they don't exist
ALTER TABLE study_sessions 
ADD COLUMN IF NOT EXISTS topic TEXT,
ADD COLUMN IF NOT EXISTS scheduled_date DATE,
ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_subject ON study_sessions(subject);
CREATE INDEX IF NOT EXISTS idx_study_sessions_deadline ON study_sessions(deadline);
CREATE INDEX IF NOT EXISTS idx_study_sessions_scheduled_date ON study_sessions(scheduled_date);

-- Ensure realtime is enabled
alter publication supabase_realtime add table study_sessions;
