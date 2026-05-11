-- migrations/02_health_logs.sql
CREATE TABLE IF NOT EXISTS health_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sleep_hours DECIMAL(4, 2) DEFAULT 0,
  water_intake_liters DECIMAL(4, 2) DEFAULT 0,
  mood VARCHAR(50) CHECK (mood IN ('Excellent', 'Good', 'Neutral', 'Stressed', 'Tired')),
  steps INTEGER DEFAULT 0,
  workout_completed BOOLEAN DEFAULT false,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, log_date)
);

CREATE INDEX idx_health_logs_user_id ON health_logs(user_id);
CREATE INDEX idx_health_logs_date ON health_logs(log_date);

ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY health_logs_auth_policy ON health_logs
  FOR ALL USING (auth.uid() = user_id);

-- Enable realtime for health_logs if publication exists
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
COMMIT;
