-- Rollback: Re-create the 'meta' row from logo_url and signature_url meta columns, then drop column
DO $$
DECLARE
    logo_meta JSONB;
    sig_meta  JSONB;
    logo_cid  TEXT := '';
    sig_cid   TEXT := '';
BEGIN
    SELECT meta INTO logo_meta FROM org_settings WHERE key = 'logo_url';
    IF FOUND AND logo_meta IS NOT NULL THEN
        logo_cid := COALESCE(logo_meta->>'cloudinary_public_id', '');
    END IF;

    SELECT meta INTO sig_meta FROM org_settings WHERE key = 'signature_url';
    IF FOUND AND sig_meta IS NOT NULL THEN
        sig_cid := COALESCE(sig_meta->>'cloudinary_public_id', '');
    END IF;

    IF logo_cid != '' OR sig_cid != '' THEN
        INSERT INTO org_settings (key, value)
        VALUES ('meta', json_build_object(
            'logo_cloudinary_id', logo_cid,
            'signature_cloudinary_id', sig_cid
        )::TEXT)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
    END IF;
END;
$$;

ALTER TABLE org_settings DROP COLUMN IF EXISTS meta;
