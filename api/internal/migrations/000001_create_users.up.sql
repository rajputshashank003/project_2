-- 000001_create_users.up.sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    phone              VARCHAR(15)  UNIQUE NOT NULL,
    name               VARCHAR(255) NOT NULL DEFAULT '',
    email              VARCHAR(255),
    role               VARCHAR(20)  NOT NULL DEFAULT 'user',
    designation        VARCHAR(50)  NOT NULL DEFAULT 'member',
    passport_photo_url TEXT,
    joined_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    is_active          BOOLEAN      NOT NULL DEFAULT TRUE
);
