-- Create the key-value org_settings table.
-- Replaces the single-wide-row ngo_config table with a flexible KV store.
-- Special key 'meta' stores a JSON blob for auxiliary data (e.g. cloudinary IDs).
CREATE TABLE IF NOT EXISTS org_settings (
    id         SERIAL       PRIMARY KEY,
    key        VARCHAR(100) UNIQUE NOT NULL,
    value      TEXT,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Migrate existing data from ngo_config into org_settings KV rows.
-- Each column becomes a key-value pair. NULL columns are skipped via CASE.
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Only migrate if ngo_config exists and has a row
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ngo_config')
    AND EXISTS (SELECT 1 FROM ngo_config WHERE id = 1)
    THEN
        SELECT * INTO r FROM ngo_config WHERE id = 1;

        -- Insert text fields (skip if NULL or empty)
        IF r.name IS NOT NULL AND r.name != '' THEN
            INSERT INTO org_settings (key, value) VALUES ('name', r.name) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        END IF;
        IF r.tagline IS NOT NULL AND r.tagline != '' THEN
            INSERT INTO org_settings (key, value) VALUES ('tagline', r.tagline) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        END IF;
        IF r.logo_url IS NOT NULL AND r.logo_url != '' THEN
            INSERT INTO org_settings (key, value) VALUES ('logo_url', r.logo_url) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        END IF;
        IF r.address IS NOT NULL AND r.address != '' THEN
            INSERT INTO org_settings (key, value) VALUES ('address', r.address) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        END IF;
        IF r.phone IS NOT NULL AND r.phone != '' THEN
            INSERT INTO org_settings (key, value) VALUES ('phone', r.phone) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        END IF;
        IF r.email IS NOT NULL AND r.email != '' THEN
            INSERT INTO org_settings (key, value) VALUES ('email', r.email) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        END IF;
        IF r.website IS NOT NULL AND r.website != '' THEN
            INSERT INTO org_settings (key, value) VALUES ('website', r.website) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        END IF;
        IF r.registration_number IS NOT NULL AND r.registration_number != '' THEN
            INSERT INTO org_settings (key, value) VALUES ('registration_number', r.registration_number) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        END IF;
        IF r.upi_id IS NOT NULL AND r.upi_id != '' THEN
            INSERT INTO org_settings (key, value) VALUES ('upi_id', r.upi_id) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        END IF;
        IF r.upi_name IS NOT NULL AND r.upi_name != '' THEN
            INSERT INTO org_settings (key, value) VALUES ('upi_name', r.upi_name) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        END IF;
        IF r.bank_name IS NOT NULL AND r.bank_name != '' THEN
            INSERT INTO org_settings (key, value) VALUES ('bank_name', r.bank_name) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        END IF;
        IF r.account_number IS NOT NULL AND r.account_number != '' THEN
            INSERT INTO org_settings (key, value) VALUES ('account_number', r.account_number) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        END IF;
        IF r.ifsc_code IS NOT NULL AND r.ifsc_code != '' THEN
            INSERT INTO org_settings (key, value) VALUES ('ifsc_code', r.ifsc_code) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        END IF;
        IF r.account_holder_name IS NOT NULL AND r.account_holder_name != '' THEN
            INSERT INTO org_settings (key, value) VALUES ('account_holder_name', r.account_holder_name) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        END IF;
        IF r.signature_url IS NOT NULL AND r.signature_url != '' THEN
            INSERT INTO org_settings (key, value) VALUES ('signature_url', r.signature_url) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        END IF;
        IF r.president_name IS NOT NULL AND r.president_name != '' THEN
            INSERT INTO org_settings (key, value) VALUES ('president_name', r.president_name) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        END IF;
        IF r.secretary_name IS NOT NULL AND r.secretary_name != '' THEN
            INSERT INTO org_settings (key, value) VALUES ('secretary_name', r.secretary_name) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        END IF;
        IF r.founded_year IS NOT NULL AND r.founded_year != 0 THEN
            INSERT INTO org_settings (key, value) VALUES ('founded_year', r.founded_year::TEXT) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        END IF;
        IF r.description IS NOT NULL AND r.description != '' THEN
            INSERT INTO org_settings (key, value) VALUES ('description', r.description) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        END IF;

        -- Store Cloudinary IDs in the special 'meta' JSON key
        IF (r.logo_cloudinary_id IS NOT NULL AND r.logo_cloudinary_id != '')
        OR (r.signature_cloudinary_id IS NOT NULL AND r.signature_cloudinary_id != '') THEN
            INSERT INTO org_settings (key, value)
            VALUES ('meta', json_build_object(
                'logo_cloudinary_id',      COALESCE(r.logo_cloudinary_id, ''),
                'signature_cloudinary_id', COALESCE(r.signature_cloudinary_id, '')
            )::TEXT)
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        END IF;
    END IF;
END;
$$;

-- Drop the old table now that data is migrated.
DROP TABLE IF EXISTS ngo_config;
