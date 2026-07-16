ALTER TABLE public.visual_settings ADD COLUMN temp_cache_bust BOOLEAN DEFAULT FALSE;
ALTER TABLE public.visual_settings DROP COLUMN temp_cache_bust;
NOTIFY pgrst, 'reload schema';