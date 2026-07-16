-- Ensure index exists
CREATE INDEX IF NOT EXISTS idx_visual_settings_company_id ON public.visual_settings(company_id);

-- Explicitly grant permissions again
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visual_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visual_settings TO anon;
GRANT ALL ON public.visual_settings TO service_role;

-- Force PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Also try another common way to trigger cache reload (modifying a comment)
COMMENT ON TABLE public.visual_settings IS 'Table for storing dynamic visual settings and themes.';