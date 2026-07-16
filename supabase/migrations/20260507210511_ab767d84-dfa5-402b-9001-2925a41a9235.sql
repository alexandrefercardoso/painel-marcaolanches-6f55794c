ALTER TABLE public.products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
COMMENT ON COLUMN public.products.active IS 'Indica se o produto está ativo ou inativo no cardápio';