-- Migration: Add enabled flag to supplements table
-- Allows users to temporarily disable supplements without deleting them

ALTER TABLE supplements ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT 1;
