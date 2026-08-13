CREATE TABLE IF NOT EXISTS team_members (
    slot           INTEGER      PRIMARY KEY,
    name           VARCHAR(255) NOT NULL DEFAULT '',
    designation    VARCHAR(255) NOT NULL DEFAULT '',
    photo_url      TEXT,
    cloudinary_id  VARCHAR(500),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed 3 default empty slots
INSERT INTO team_members (slot) VALUES (1),(2),(3) ON CONFLICT (slot) DO NOTHING;
