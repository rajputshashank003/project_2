CREATE TABLE IF NOT EXISTS id_cards (
    id                     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID         REFERENCES users(id) ON DELETE SET NULL,
    user_name              VARCHAR(255) NOT NULL,
    phone                  VARCHAR(15),
    email                  VARCHAR(255),
    address                TEXT,
    designation            VARCHAR(50),
    passport_photo_url     TEXT,
    payment_screenshot_url TEXT,
    unique_card_number     VARCHAR(100) UNIQUE,
    status                 VARCHAR(20)  NOT NULL DEFAULT 'pending',
    rejection_reason       TEXT,
    validity_years         INTEGER,
    issue_date             TIMESTAMPTZ,
    expiry_date            TIMESTAMPTZ,
    requested_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    reviewed_at            TIMESTAMPTZ,
    reviewed_by            VARCHAR(255)
);

CREATE INDEX idx_id_cards_status     ON id_cards(status);
CREATE INDEX idx_id_cards_created_at ON id_cards(requested_at DESC);
CREATE INDEX idx_id_cards_user_id    ON id_cards(user_id);
