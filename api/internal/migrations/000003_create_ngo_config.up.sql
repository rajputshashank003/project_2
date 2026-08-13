CREATE TABLE IF NOT EXISTS ngo_config (
    id                       INTEGER      PRIMARY KEY DEFAULT 1,
    name                     VARCHAR(255),
    tagline                  VARCHAR(500),
    logo_url                 TEXT,
    logo_cloudinary_id       VARCHAR(500),
    address                  TEXT,
    phone                    VARCHAR(20),
    email                    VARCHAR(255),
    website                  VARCHAR(500),
    registration_number      VARCHAR(100),
    upi_id                   VARCHAR(100),
    upi_name                 VARCHAR(255),
    bank_name                VARCHAR(255),
    account_number           VARCHAR(50),
    ifsc_code                VARCHAR(20),
    account_holder_name      VARCHAR(255),
    signature_url            TEXT,
    signature_cloudinary_id  VARCHAR(500),
    president_name           VARCHAR(255),
    secretary_name           VARCHAR(255),
    founded_year             INTEGER,
    description              TEXT,
    updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed default row so GET /ngo/config always returns something
INSERT INTO ngo_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
