-- Add meal favorites table for quick-adding common meals
CREATE TABLE IF NOT EXISTS meal_favorites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  foods TEXT NOT NULL,
  created_at TEXT NOT NULL
);
