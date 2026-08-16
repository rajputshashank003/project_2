-- Add blood_group column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10) NOT NULL DEFAULT '';
