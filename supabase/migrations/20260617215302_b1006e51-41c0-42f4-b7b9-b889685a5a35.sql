
-- Add new columns to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS unidade text NOT NULL DEFAULT 'UN',
  ADD COLUMN IF NOT EXISTS tipo_produto text NOT NULL DEFAULT 'MERCADORIA',
  ADD COLUMN IF NOT EXISTS tax_rule_id uuid;

-- Create product_tax_rules table
CREATE TABLE IF NOT EXISTS public.product_tax_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  cst text,
  cfop text,
  aliquota_ibs numeric(7,4) DEFAULT 0,
  aliquota_cbs numeric(7,4) DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_tax_rules TO anon, authenticated;
GRANT ALL ON public.product_tax_rules TO service_role;

ALTER TABLE public.product_tax_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on product_tax_rules" ON public.product_tax_rules
  FOR ALL USING (true) WITH CHECK (true);

-- FK
ALTER TABLE public.products
  ADD CONSTRAINT products_tax_rule_id_fkey FOREIGN KEY (tax_rule_id)
  REFERENCES public.product_tax_rules(id) ON DELETE SET NULL;

CREATE TRIGGER update_product_tax_rules_updated_at
  BEFORE UPDATE ON public.product_tax_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
