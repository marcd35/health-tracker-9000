-- Add custom_nutrients column to supplements table
ALTER TABLE supplements ADD COLUMN custom_nutrients TEXT DEFAULT '{}';

-- Create custom nutrient metadata table
CREATE TABLE IF NOT EXISTS custom_nutrient_metadata (
  id TEXT PRIMARY KEY,
  nutrient_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  category TEXT NOT NULL,
  user_defined_target REAL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Create supplement database table for prepopulation
CREATE TABLE IF NOT EXISTS supplement_database (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  serving_size TEXT,
  serving_count INTEGER,
  nutrients TEXT DEFAULT '{}',
  custom_nutrients TEXT DEFAULT '{}',
  notes TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(name, brand, serving_size, serving_count)
);
