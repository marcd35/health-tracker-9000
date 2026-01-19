-- User Profile
CREATE TABLE IF NOT EXISTS profile (
  id TEXT PRIMARY KEY,
  age INTEGER NOT NULL,
  weight REAL NOT NULL,
  height REAL NOT NULL,
  gender TEXT NOT NULL,
  activity_level TEXT NOT NULL,
  health_conditions TEXT, -- JSON array
  allergies TEXT, -- JSON array
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- User Conditions
CREATE TABLE IF NOT EXISTS user_conditions (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profile(id)
);

-- User Allergies
CREATE TABLE IF NOT EXISTS user_allergies (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profile(id)
);

-- Nutritional Targets
CREATE TABLE IF NOT EXISTS nutritional_targets (
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
  created_at TEXT NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profile(id)
);

-- Foods Database
CREATE TABLE IF NOT EXISTS foods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  serving_size REAL NOT NULL,
  serving_unit TEXT NOT NULL,
  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,
  fiber REAL,
  -- Add all other nutrients as columns
  allergens TEXT, -- JSON array
  created_at TEXT NOT NULL
);

-- User's Supplements
CREATE TABLE IF NOT EXISTS supplements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  serving_size TEXT NOT NULL,
  nutrients TEXT NOT NULL, -- JSON
  notes TEXT,
  created_at TEXT NOT NULL
);

-- Daily Meal Logs
CREATE TABLE IF NOT EXISTS meal_logs (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  foods TEXT NOT NULL, -- JSON array
  total_nutrition TEXT NOT NULL, -- JSON
  created_at TEXT NOT NULL
);

-- Daily Supplement Logs
CREATE TABLE IF NOT EXISTS supplement_logs (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  supplement_id TEXT NOT NULL,
  supplement_name TEXT NOT NULL,
  taken INTEGER NOT NULL, -- boolean as 0/1
  created_at TEXT NOT NULL,
  FOREIGN KEY (supplement_id) REFERENCES supplements(id)
);

-- Daily Summary
CREATE TABLE IF NOT EXISTS daily_summary (
  date TEXT PRIMARY KEY,
  weight REAL,
  total_nutrition TEXT NOT NULL, -- JSON
  health_score REAL NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_meal_logs_date ON meal_logs(date);
CREATE INDEX IF NOT EXISTS idx_supplement_logs_date ON supplement_logs(date);
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);
CREATE INDEX IF NOT EXISTS idx_supplement_logs_date_id ON supplement_logs(date, supplement_id);
CREATE INDEX IF NOT EXISTS idx_nutritional_targets_profile_id ON nutritional_targets(profile_id);
