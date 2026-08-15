DROP INDEX IF EXISTS idx_donations_user_id;
ALTER TABLE donations DROP COLUMN IF EXISTS user_id;
