-- Migration: Add additional missing database indexes for performance
-- These composite indexes were identified as critical for query performance

-- Composite index for daily calorie tracking queries by profile and date
CREATE INDEX IF NOT EXISTS idx_daily_calorie_tracking_profile_date
  ON daily_calorie_tracking(profile_id, date);

-- Composite index for calorie streaks queries by profile and end date
CREATE INDEX IF NOT EXISTS idx_calorie_streaks_profile
  ON calorie_streaks(profile_id, streak_end_date);