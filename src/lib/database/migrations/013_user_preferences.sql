-- Migration: Create user_preferences table
-- Stores user UI customization and feature toggles

CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  show_clock BOOLEAN NOT NULL DEFAULT 1,
  show_health_insights BOOLEAN NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Ensure only one preference row per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Insert default preferences
INSERT OR IGNORE INTO user_preferences (id, user_id, timezone, show_clock, show_health_insights, created_at, updated_at)
VALUES ('default', 'default', 'America/New_York', 1, 0, datetime('now'), datetime('now'));
