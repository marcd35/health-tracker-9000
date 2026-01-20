-- Add food_allergens table for granular allergen tracking
CREATE TABLE IF NOT EXISTS food_allergens (
  id TEXT PRIMARY KEY,
  food_id TEXT NOT NULL,
  allergen_type TEXT NOT NULL, -- e.g., 'milk', 'peanuts'
  source TEXT NOT NULL, -- 'auto_detected' | 'user_flagged' | 'external_db'
  confidence_level TEXT DEFAULT 'medium', -- 'high' | 'medium' | 'low'
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
);

-- Index for faster lookups by food_id
CREATE INDEX IF NOT EXISTS idx_food_allergens_food_id ON food_allergens(food_id);
