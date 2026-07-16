ALTER TABLE public.product_recipe ADD COLUMN IF NOT EXISTS variant_label text;
CREATE INDEX IF NOT EXISTS idx_product_recipe_product ON public.product_recipe(product_id);
CREATE INDEX IF NOT EXISTS idx_product_recipe_ingredient ON public.product_recipe(ingredient_id);