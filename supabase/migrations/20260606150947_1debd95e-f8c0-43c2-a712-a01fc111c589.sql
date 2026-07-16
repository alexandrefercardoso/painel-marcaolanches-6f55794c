DROP TABLE IF EXISTS public.visual_settings;
DROP FUNCTION IF EXISTS public.handle_updated_at_column CASCADE;
-- Note: handle_updated_at_column might be shared, let's just drop the trigger instead if we want to be safe, 
-- but usually triggers are dropped when the table is dropped.
