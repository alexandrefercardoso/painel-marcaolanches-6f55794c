ALTER TABLE public.product_tax_rules
ADD COLUMN IF NOT EXISTS cst_ibscbs varchar(3) DEFAULT NULL;