ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS centralized_printing BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.store_settings.centralized_printing IS 'If true, all items are printed in a single printer (usually the cashier) regardless of sector/category mappings.';

GRANT SELECT, UPDATE ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;