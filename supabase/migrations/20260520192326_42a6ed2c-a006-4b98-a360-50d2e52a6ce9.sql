ALTER TABLE public.products ADD COLUMN IF NOT EXISTS suggested_products UUID[] DEFAULT '{}';

COMMENT ON COLUMN public.products.suggested_products IS 'List of product IDs to suggest when this product is selected.';