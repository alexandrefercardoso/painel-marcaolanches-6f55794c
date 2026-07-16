
-- 1) Products: novas colunas
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT 'VENDA',
  ADD COLUMN IF NOT EXISTS control_inventory boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_sell_without_stock boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS unit text,
  ADD COLUMN IF NOT EXISTS current_stock numeric(14,4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS minimum_stock numeric(14,4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS purchase_price numeric(14,4),
  ADD COLUMN IF NOT EXISTS yield_quantity numeric(14,4),
  ADD COLUMN IF NOT EXISTS cost_per_unit numeric(14,6),
  ADD COLUMN IF NOT EXISTS loss_percentage numeric(6,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS packaging_cost numeric(14,4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS energy_cost numeric(14,4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS labor_cost numeric(14,4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS desired_margin_percentage numeric(6,2),
  ADD COLUMN IF NOT EXISTS supplier_name text,
  ADD COLUMN IF NOT EXISTS ean_code text,
  ADD COLUMN IF NOT EXISTS supplier_code text;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_product_type_check;
ALTER TABLE public.products
  ADD CONSTRAINT products_product_type_check
  CHECK (product_type IN ('VENDA','INGREDIENTE','AMBOS','SERVICO'));

CREATE INDEX IF NOT EXISTS idx_products_product_type ON public.products(product_type);

-- 2) product_recipe
CREATE TABLE IF NOT EXISTS public.product_recipe (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity numeric(14,4) NOT NULL DEFAULT 0,
  unit text,
  waste_percentage numeric(6,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, ingredient_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_recipe TO authenticated, anon;
GRANT ALL ON public.product_recipe TO service_role;
ALTER TABLE public.product_recipe ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public manage product_recipe" ON public.product_recipe
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_product_recipe_product ON public.product_recipe(product_id);
CREATE INDEX IF NOT EXISTS idx_product_recipe_ingredient ON public.product_recipe(ingredient_id);

CREATE TRIGGER trg_product_recipe_updated
  BEFORE UPDATE ON public.product_recipe
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) stock_movements
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type text NOT NULL,
  quantity numeric(14,4) NOT NULL,
  unit_cost numeric(14,6),
  reason text,
  reference_id uuid,
  reference_type text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (movement_type IN ('IN','OUT','ADJUST','LOSS'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_movements TO authenticated, anon;
GRANT ALL ON public.stock_movements TO service_role;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public manage stock_movements" ON public.stock_movements
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON public.stock_movements(created_at DESC);
