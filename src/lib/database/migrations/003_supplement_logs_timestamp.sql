-- Add timestamp and duplicate warning tracking to supplement logs
ALTER TABLE supplement_logs ADD COLUMN taken_at TEXT;
ALTER TABLE supplement_logs ADD COLUMN is_duplicate_warning INTEGER DEFAULT 0;
