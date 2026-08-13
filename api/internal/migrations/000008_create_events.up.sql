CREATE TABLE IF NOT EXISTS events (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(500) NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by  VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS event_images (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id      UUID         NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    image_url     TEXT         NOT NULL,
    cloudinary_id VARCHAR(500),
    caption       VARCHAR(500)
);

CREATE INDEX idx_events_created_at      ON events(created_at DESC);
CREATE INDEX idx_event_images_event_id  ON event_images(event_id);
