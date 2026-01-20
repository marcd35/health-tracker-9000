-- Add dosage and color tracking to supplements table
ALTER TABLE supplements ADD COLUMN color TEXT DEFAULT '#6366f1';
ALTER TABLE supplements ADD COLUMN dosage_frequency TEXT DEFAULT 'daily';
ALTER TABLE supplements ADD COLUMN dosage_quantity INTEGER DEFAULT 1;
ALTER TABLE supplements ADD COLUMN dosage_notes TEXT;
