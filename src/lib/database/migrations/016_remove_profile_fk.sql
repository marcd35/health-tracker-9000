-- Remove profile FK constraints for security
-- Profile data is stored ONLY in profile.json, not in database
-- This migration drops FK constraints by recreating tables without them

-- ============================================================
-- CALORIE TRACKING TABLES
-- ============================================================

-- Drop and recreate calorie_goals without FK constraint
DROP TABLE IF EXISTS calorie_goals_backup;
CREATE TABLE calorie_goals_backup AS SELECT * FROM calorie_goals;
DROP TABLE calorie_goals;

CREATE TABLE calorie_goals (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  goal_type TEXT NOT NULL,
  weekly_calorie_target INTEGER NOT NULL,
  daily_calorie_target INTEGER NOT NULL,
  activity_level TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO calorie_goals SELECT * FROM calorie_goals_backup;
DROP TABLE calorie_goals_backup;

-- Drop and recreate calorie_goal_history without FK constraint
DROP TABLE IF EXISTS calorie_goal_history_backup;
CREATE TABLE calorie_goal_history_backup AS SELECT * FROM calorie_goal_history;
DROP TABLE calorie_goal_history;

CREATE TABLE calorie_goal_history (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  calorie_goal_id TEXT NOT NULL,
  action TEXT NOT NULL,
  previous_daily_target INTEGER,
  new_daily_target INTEGER,
  change_reason TEXT,
  changed_at TEXT NOT NULL
);

INSERT INTO calorie_goal_history SELECT * FROM calorie_goal_history_backup;
DROP TABLE calorie_goal_history_backup;

-- Drop and recreate daily_calorie_tracking without FK constraint
DROP TABLE IF EXISTS daily_calorie_tracking_backup;
CREATE TABLE daily_calorie_tracking_backup AS SELECT * FROM daily_calorie_tracking;
DROP TABLE daily_calorie_tracking;

CREATE TABLE daily_calorie_tracking (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  profile_id TEXT NOT NULL,
  calories_consumed INTEGER NOT NULL,
  calories_target INTEGER NOT NULL,
  calories_deficit_surplus INTEGER,
  goal_met INTEGER DEFAULT 0,
  weekly_total_consumed INTEGER,
  weekly_total_target INTEGER,
  weekly_average INTEGER,
  on_pace_percentage INTEGER,
  trend TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO daily_calorie_tracking SELECT * FROM daily_calorie_tracking_backup;
DROP TABLE daily_calorie_tracking_backup;

-- Drop and recreate calorie_streaks without FK constraint
DROP TABLE IF EXISTS calorie_streaks_backup;
CREATE TABLE calorie_streaks_backup AS SELECT * FROM calorie_streaks;
DROP TABLE calorie_streaks;

CREATE TABLE calorie_streaks (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  streak_start_date TEXT NOT NULL,
  streak_end_date TEXT,
  days_count INTEGER NOT NULL,
  goal_met_count INTEGER NOT NULL,
  best_streak INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL
);

-- Insert with default values for new columns
INSERT INTO calorie_streaks (
  id, profile_id, streak_start_date, streak_end_date,
  days_count, goal_met_count, best_streak, is_active, created_at
)
SELECT 
  id, profile_id, streak_start_date, streak_end_date,
  days_count, goal_met_count, best_streak,
  CASE WHEN streak_end_date IS NULL THEN 1 ELSE 0 END as is_active,
  COALESCE(streak_start_date, datetime('now'))
FROM calorie_streaks_backup;

DROP TABLE calorie_streaks_backup;

-- ============================================================
-- OTHER TABLES WITH PROFILE FK
-- ============================================================

-- Drop and recreate user_conditions without FK constraint
DROP TABLE IF EXISTS user_conditions_backup;
CREATE TABLE user_conditions_backup AS SELECT * FROM user_conditions;
DROP TABLE user_conditions;

CREATE TABLE user_conditions (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

INSERT INTO user_conditions SELECT * FROM user_conditions_backup;
DROP TABLE user_conditions_backup;

-- Drop and recreate user_allergies without FK constraint
DROP TABLE IF EXISTS user_allergies_backup;
CREATE TABLE user_allergies_backup AS SELECT * FROM user_allergies;
DROP TABLE user_allergies;

CREATE TABLE user_allergies (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

INSERT INTO user_allergies SELECT * FROM user_allergies_backup;
DROP TABLE user_allergies_backup;

-- Drop and recreate nutritional_targets without FK constraint
DROP TABLE IF EXISTS nutritional_targets_backup;
CREATE TABLE nutritional_targets_backup AS SELECT * FROM nutritional_targets;
DROP TABLE nutritional_targets;

CREATE TABLE nutritional_targets (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,
  fiber REAL NOT NULL,
  vitamin_a REAL,
  vitamin_c REAL,
  vitamin_d REAL,
  vitamin_e REAL,
  vitamin_k REAL,
  thiamin REAL,
  riboflavin REAL,
  niacin REAL,
  vitamin_b6 REAL,
  folate REAL,
  vitamin_b12 REAL,
  calcium REAL,
  iron REAL,
  magnesium REAL,
  potassium REAL,
  zinc REAL,
  selenium REAL,
  created_at TEXT NOT NULL
);

INSERT INTO nutritional_targets SELECT * FROM nutritional_targets_backup;
DROP TABLE nutritional_targets_backup;

-- Drop and recreate weight_logs without FK constraint
DROP TABLE IF EXISTS weight_logs_backup;
CREATE TABLE weight_logs_backup AS SELECT * FROM weight_logs;
DROP TABLE weight_logs;

CREATE TABLE weight_logs (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  date TEXT NOT NULL,
  weight REAL NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(profile_id, date)
);

INSERT INTO weight_logs SELECT * FROM weight_logs_backup;
DROP TABLE weight_logs_backup;

-- ============================================================
-- DROP PROFILE TABLE (not used - data is in profile.json)
-- ============================================================
DROP TABLE IF EXISTS profile;

-- Recreate indexes for performance
CREATE INDEX IF NOT EXISTS idx_calorie_goals_profile_id ON calorie_goals(profile_id);
CREATE INDEX IF NOT EXISTS idx_calorie_goals_start_date ON calorie_goals(start_date);
CREATE INDEX IF NOT EXISTS idx_calorie_goal_history_profile_id ON calorie_goal_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_calorie_goal_history_goal_id ON calorie_goal_history(calorie_goal_id);
CREATE INDEX IF NOT EXISTS idx_daily_calorie_tracking_date ON daily_calorie_tracking(date);
CREATE INDEX IF NOT EXISTS idx_daily_calorie_tracking_profile_id ON daily_calorie_tracking(profile_id);
CREATE INDEX IF NOT EXISTS idx_calorie_streaks_profile_id ON calorie_streaks(profile_id);
CREATE INDEX IF NOT EXISTS idx_calorie_streaks_start_date ON calorie_streaks(streak_start_date);
CREATE INDEX IF NOT EXISTS idx_weight_logs_date ON weight_logs(date);
CREATE INDEX IF NOT EXISTS idx_nutritional_targets_profile_id ON nutritional_targets(profile_id);
