-- Add USDA integration columns to foods table
ALTER TABLE foods ADD COLUMN source TEXT DEFAULT 'manual';
ALTER TABLE foods ADD COLUMN usda_fdc_id TEXT;

-- Add additional nutrient columns for USDA foods
ALTER TABLE foods ADD COLUMN sugar REAL;

-- Create index for USDA FDC ID lookups
CREATE INDEX IF NOT EXISTS idx_foods_usda_fdc_id ON foods(usda_fdc_id);
