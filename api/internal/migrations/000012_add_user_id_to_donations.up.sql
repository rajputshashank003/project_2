-- Add user_id foreign key to donations so we can query per-user donations.
-- Existing donations will have user_id = NULL (no way to backfill without audit trail).
ALTER TABLE donations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
