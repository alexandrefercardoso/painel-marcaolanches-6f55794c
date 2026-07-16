ALTER TABLE public.delivery_areas ADD COLUMN polygon_coords JSONB;
COMMENT ON COLUMN public.delivery_areas.polygon_coords IS 'Stores an array of [lat, lng] coordinates for free-form polygon shapes';