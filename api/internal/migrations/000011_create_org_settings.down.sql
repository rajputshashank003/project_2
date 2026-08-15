-- Rollback: recreate ngo_config, restore data from org_settings, drop org_settings.
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

-- Re-seed default row
INSERT INTO ngo_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Restore data from org_settings into ngo_config row
DO $$
DECLARE
    kv RECORD;
    meta_json JSONB;
BEGIN
    FOR kv IN SELECT key, value FROM org_settings LOOP
        CASE kv.key
            WHEN 'name'                THEN UPDATE ngo_config SET name = kv.value WHERE id = 1;
            WHEN 'tagline'             THEN UPDATE ngo_config SET tagline = kv.value WHERE id = 1;
            WHEN 'logo_url'            THEN UPDATE ngo_config SET logo_url = kv.value WHERE id = 1;
            WHEN 'address'             THEN UPDATE ngo_config SET address = kv.value WHERE id = 1;
            WHEN 'phone'               THEN UPDATE ngo_config SET phone = kv.value WHERE id = 1;
            WHEN 'email'               THEN UPDATE ngo_config SET email = kv.value WHERE id = 1;
            WHEN 'website'             THEN UPDATE ngo_config SET website = kv.value WHERE id = 1;
            WHEN 'registration_number' THEN UPDATE ngo_config SET registration_number = kv.value WHERE id = 1;
            WHEN 'upi_id'              THEN UPDATE ngo_config SET upi_id = kv.value WHERE id = 1;
            WHEN 'upi_name'            THEN UPDATE ngo_config SET upi_name = kv.value WHERE id = 1;
            WHEN 'bank_name'           THEN UPDATE ngo_config SET bank_name = kv.value WHERE id = 1;
            WHEN 'account_number'      THEN UPDATE ngo_config SET account_number = kv.value WHERE id = 1;
            WHEN 'ifsc_code'           THEN UPDATE ngo_config SET ifsc_code = kv.value WHERE id = 1;
            WHEN 'account_holder_name' THEN UPDATE ngo_config SET account_holder_name = kv.value WHERE id = 1;
            WHEN 'signature_url'       THEN UPDATE ngo_config SET signature_url = kv.value WHERE id = 1;
            WHEN 'president_name'      THEN UPDATE ngo_config SET president_name = kv.value WHERE id = 1;
            WHEN 'secretary_name'      THEN UPDATE ngo_config SET secretary_name = kv.value WHERE id = 1;
            WHEN 'founded_year'        THEN UPDATE ngo_config SET founded_year = kv.value::INTEGER WHERE id = 1;
            WHEN 'description'         THEN UPDATE ngo_config SET description = kv.value WHERE id = 1;
            WHEN 'meta' THEN
                meta_json := kv.value::JSONB;
                UPDATE ngo_config
                SET logo_cloudinary_id      = meta_json->>'logo_cloudinary_id',
                    signature_cloudinary_id = meta_json->>'signature_cloudinary_id'
                WHERE id = 1;
            ELSE NULL;
        END CASE;
    END LOOP;
END;
$$;

DROP TABLE IF EXISTS org_settings;
