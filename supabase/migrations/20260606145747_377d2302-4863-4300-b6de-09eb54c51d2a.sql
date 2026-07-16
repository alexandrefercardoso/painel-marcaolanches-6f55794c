-- Check if the unique constraint already exists, if not, add it.
-- Based on the read_query result, 'visual_settings_company_id_key' already exists as a UNIQUE constraint.
-- However, if the user is reporting the error, there might be a mismatch in the database state or multiple partial indexes.
-- We will drop any non-unique index that might be interfering and re-ensure the unique constraint.

DO $$
BEGIN
    -- Drop the non-unique index if it exists
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_visual_settings_company_id') THEN
        DROP INDEX idx_visual_settings_company_id;
    END IF;

    -- Re-create the unique constraint if it doesn't exist (though the tool said it did, we make it robust)
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'visual_settings_company_id_key'
    ) THEN
        ALTER TABLE public.visual_settings ADD CONSTRAINT visual_settings_company_id_key UNIQUE (company_id);
    END IF;
END $$;

GRANT ALL ON public.visual_settings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visual_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visual_settings TO anon;
