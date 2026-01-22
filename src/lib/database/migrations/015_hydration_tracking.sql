-- Add hydration_enabled to user_preferences table
ALTER TABLE user_preferences ADD COLUMN hydration_enabled INTEGER DEFAULT 0;

-- Add hydration_ml column to daily_summary for future hydration data
ALTER TABLE daily_summary ADD COLUMN hydration_ml REAL DEFAULT 0;