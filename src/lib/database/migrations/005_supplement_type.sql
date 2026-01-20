-- Add supplement_type column to supplements table
ALTER TABLE supplements ADD COLUMN supplement_type TEXT DEFAULT 'nutrient';

-- Auto-categorize existing supplements:
-- If a supplement has nutrients, it's a 'nutrient' type (already default)
-- If a supplement has no nutrients (empty JSON), it's a 'custom' type
UPDATE supplements
SET supplement_type = 'custom'
WHERE nutrients = '{}' OR nutrients IS NULL OR nutrients = '';
