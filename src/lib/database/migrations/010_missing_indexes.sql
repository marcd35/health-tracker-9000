-- Migration: Add missing database indexes for performance
-- These indexes were identified as critical for query performance

-- Index for daily summary date lookups
CREATE INDEX IF NOT EXISTS idx_daily_summary_date
  ON daily_summary(date);

-- Index for weight logs date queries
CREATE INDEX IF NOT EXISTS idx_weight_logs_date
  ON weight_logs(date);