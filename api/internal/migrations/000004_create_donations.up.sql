CREATE TABLE IF NOT EXISTS donations (
    id                     UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_name             VARCHAR(255)  NOT NULL,
    phone                  VARCHAR(15),
    email                  VARCHAR(255),
    amount                 DECIMAL(10,2) NOT NULL,
    payment_screenshot_url TEXT,
    utr_number             VARCHAR(100),
    status                 VARCHAR(20)   NOT NULL DEFAULT 'pending',
    rejection_reason       TEXT,
    certificate_url        TEXT,
    certificate_number     VARCHAR(100)  UNIQUE,
    requested_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    reviewed_at            TIMESTAMPTZ,
    reviewed_by            VARCHAR(255)
);

CREATE INDEX idx_donations_status     ON donations(status);
CREATE INDEX idx_donations_created_at ON donations(requested_at DESC);
