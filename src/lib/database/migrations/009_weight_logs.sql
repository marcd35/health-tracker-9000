-- Migration: Add weight_logs table for tracking weight over time
-- This table stores daily weight check-ins for the user

CREATE TABLE IF NOT EXISTS weight_logs (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  weight REAL NOT NULL,
  date TEXT NOT NULL, -- ISO 8601 date (YYYY-MM-DD)
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE,
  UNIQUE(profile_id, date) -- One weight entry per day per profile
);

CREATE INDEX IF NOT EXISTS idx_weight_logs_profile_date ON weight_logs(profile_id, date DESC);
