ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS size_prices JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS allow_half_half BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_pizza_flavor BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.products.size_prices IS 'Store prices for different sizes like {"small": 30, "medium": 45, "large": 60}';
COMMENT ON COLUMN public.products.allow_half_half IS 'Whether this product can be ordered as half-and-half';
COMMENT ON COLUMN public.products.is_pizza_flavor IS 'Whether this product can be selected as a flavor for split pizzas';