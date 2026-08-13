CREATE TABLE IF NOT EXISTS gallery_images (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url     TEXT         NOT NULL,
    cloudinary_id VARCHAR(500),
    caption       VARCHAR(500),
    uploaded_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    uploaded_by   VARCHAR(255)
);
