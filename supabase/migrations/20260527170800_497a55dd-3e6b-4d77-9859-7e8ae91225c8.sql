-- Grant access to roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visual_settings TO authenticated;
GRANT SELECT ON public.visual_settings TO anon;
GRANT ALL ON public.visual_settings TO service_role;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';