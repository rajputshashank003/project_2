-- Add JSONB meta column to org_settings table
ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS meta JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Migrate any existing data from the legacy 'meta' row into respective rows' meta column
DO $$
DECLARE
    meta_row RECORD;
    logo_cid TEXT;
    sig_cid  TEXT;
BEGIN
    SELECT * INTO meta_row FROM org_settings WHERE key = 'meta';
    IF FOUND THEN
        BEGIN
            logo_cid := meta_row.value::jsonb->>'logo_cloudinary_id';
            sig_cid  := meta_row.value::jsonb->>'signature_cloudinary_id';

            IF logo_cid IS NOT NULL AND logo_cid != '' THEN
                UPDATE org_settings 
                SET meta = jsonb_build_object('cloudinary_public_id', logo_cid),
                    updated_at = NOW()
                WHERE key = 'logo_url';
            END IF;

            IF sig_cid IS NOT NULL AND sig_cid != '' THEN
                UPDATE org_settings 
                SET meta = jsonb_build_object('cloudinary_public_id', sig_cid),
                    updated_at = NOW()
                WHERE key = 'signature_url';
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- If corrupted JSON, ignore extraction
        END;

        -- Delete the standalone 'meta' row now that meta is a column
        DELETE FROM org_settings WHERE key = 'meta';
    END IF;
END;
$$;
