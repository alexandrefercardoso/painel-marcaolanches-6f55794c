
-- 1. Tabela empresas
CREATE TABLE public.empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text UNIQUE,
  logo text,
  telefone text,
  whatsapp text,
  endereco text,
  cor_primaria text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on empresas" ON public.empresas
  FOR ALL USING (true) WITH CHECK (true);

-- 2. Seed empresa padrão a partir de store_settings (ou fallback)
INSERT INTO public.empresas (nome, slug, logo, whatsapp, endereco)
SELECT
  COALESCE(NULLIF(s.name, ''), 'Empresa Padrão'),
  'default',
  s.logo_url,
  s.whatsapp_number,
  s.address
FROM public.store_settings s
LIMIT 1;

-- Garante ao menos uma empresa mesmo sem store_settings
INSERT INTO public.empresas (nome, slug)
SELECT 'Empresa Padrão', 'default'
WHERE NOT EXISTS (SELECT 1 FROM public.empresas);

-- 3. Adicionar company_id nas tabelas, backfill e index
DO $$
DECLARE
  default_company_id uuid;
  t text;
  tables text[] := ARRAY[
    'products','categories','delivery_orders','delivery_order_items',
    'customers','profiles','drivers','financial_transactions',
    'financial_categories','chart_of_accounts','cashier_sessions',
    'driver_trips','store_settings','delivery_areas'
  ];
BEGIN
  SELECT id INTO default_company_id FROM public.empresas ORDER BY created_at LIMIT 1;

  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.empresas(id)', t);
    EXECUTE format('UPDATE public.%I SET company_id = %L WHERE company_id IS NULL', t, default_company_id);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I(company_id)', 'idx_' || t || '_company_id', t);
  END LOOP;
END $$;
