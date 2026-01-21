-- Migration: Add displayName field to profile table
-- Allows personalized greetings on the dashboard

ALTER TABLE profile ADD COLUMN display_name TEXT;
