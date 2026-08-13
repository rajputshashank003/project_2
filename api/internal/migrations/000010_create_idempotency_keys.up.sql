CREATE TABLE IF NOT EXISTS idempotency_keys (
    key        VARCHAR(255) NOT NULL,
    endpoint   VARCHAR(255) NOT NULL,
    response   JSONB,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (key, endpoint)
);

CREATE INDEX idx_idempotency_key_endpoint ON idempotency_keys(key, endpoint);
