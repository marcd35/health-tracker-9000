-- Calorie Goals - User's weight loss/gain/maintenance targets
CREATE TABLE IF NOT EXISTS calorie_goals (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  goal_type TEXT NOT NULL, -- 'weight_loss' | 'maintenance' | 'gain'
  weekly_calorie_target INTEGER NOT NULL, -- deficit/surplus per week (e.g., -3500 for 1lb loss)
  daily_calorie_target INTEGER NOT NULL, -- calculated from weekly + TDEE
  activity_level TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT, -- null if current goal
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profile(id)
);

-- Calorie Goal History - Audit trail of goal changes
CREATE TABLE IF NOT EXISTS calorie_goal_history (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  calorie_goal_id TEXT NOT NULL,
  action TEXT NOT NULL, -- 'created' | 'updated' | 'archived'
  previous_daily_target INTEGER,
  new_daily_target INTEGER,
  change_reason TEXT,
  changed_at TEXT NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profile(id),
  FOREIGN KEY (calorie_goal_id) REFERENCES calorie_goals(id)
);

-- Daily Calorie Tracking - Track daily progress toward goals
CREATE TABLE IF NOT EXISTS daily_calorie_tracking (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  profile_id TEXT NOT NULL,
  calories_consumed INTEGER NOT NULL,
  calories_target INTEGER NOT NULL,
  calories_deficit_surplus INTEGER, -- negative = deficit, positive = surplus
  goal_met INTEGER DEFAULT 0, -- 1 = met, 0 = missed
  weekly_total_consumed INTEGER,
  weekly_total_target INTEGER,
  weekly_average INTEGER,
  on_pace_percentage INTEGER, -- 0-100+ how close to weekly goal
  trend TEXT, -- 'up', 'down', 'stable'
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profile(id)
);

-- Calorie Streaks - Track consecutive days meeting calorie goals
CREATE TABLE IF NOT EXISTS calorie_streaks (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  streak_start_date TEXT NOT NULL,
  streak_end_date TEXT, -- null if ongoing
  days_count INTEGER NOT NULL,
  goal_met_count INTEGER NOT NULL, -- days where deficit/surplus was met
  best_streak INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profile(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calorie_goals_profile_id ON calorie_goals(profile_id);
CREATE INDEX IF NOT EXISTS idx_calorie_goals_start_date ON calorie_goals(start_date);
CREATE INDEX IF NOT EXISTS idx_calorie_goal_history_profile_id ON calorie_goal_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_calorie_goal_history_goal_id ON calorie_goal_history(calorie_goal_id);
CREATE INDEX IF NOT EXISTS idx_daily_calorie_tracking_date ON daily_calorie_tracking(date);
CREATE INDEX IF NOT EXISTS idx_daily_calorie_tracking_profile_id ON daily_calorie_tracking(profile_id);
CREATE INDEX IF NOT EXISTS idx_calorie_streaks_profile_id ON calorie_streaks(profile_id);
CREATE INDEX IF NOT EXISTS idx_calorie_streaks_start_date ON calorie_streaks(streak_start_date);
