
CREATE TABLE IF NOT EXISTS public.fiscal_cclass_trib (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cst TEXT NOT NULL,
  classificacao TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  aliquota_ibs NUMERIC(7,4) DEFAULT 0,
  aliquota_cbs NUMERIC(7,4) DEFAULT 0,
  g_trib_regular BOOLEAN NOT NULL DEFAULT true,
  nfe BOOLEAN NOT NULL DEFAULT true,
  nfce BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cst, classificacao)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fiscal_cclass_trib TO anon, authenticated;
GRANT ALL ON public.fiscal_cclass_trib TO service_role;

ALTER TABLE public.fiscal_cclass_trib ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fiscal_cclass_trib_all" ON public.fiscal_cclass_trib FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER trg_fiscal_cclass_trib_updated_at
BEFORE UPDATE ON public.fiscal_cclass_trib
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
