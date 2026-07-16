
DROP TABLE IF EXISTS public.fiscal_cclass_trib CASCADE;

CREATE TABLE public.fiscal_cclass_trib (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cst text,
  cst_ibs_cbs text,
  cclass_trib text,
  nome_cclass_trib text,
  descr_cclass_trib text,
  pred_ibs numeric DEFAULT 0,
  pred_cbs numeric DEFAULT 0,
  aliquota_cbs numeric DEFAULT 0,
  ind_g_trib_regular boolean DEFAULT true,
  ind_nfe boolean DEFAULT true,
  ind_nfce boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fiscal_cclass_trib TO authenticated, anon;
GRANT ALL ON public.fiscal_cclass_trib TO service_role;

ALTER TABLE public.fiscal_cclass_trib ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fiscal_cclass_trib_select" ON public.fiscal_cclass_trib FOR SELECT USING (true);
CREATE POLICY "fiscal_cclass_trib_insert" ON public.fiscal_cclass_trib FOR INSERT WITH CHECK (true);
CREATE POLICY "fiscal_cclass_trib_update" ON public.fiscal_cclass_trib FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "fiscal_cclass_trib_delete" ON public.fiscal_cclass_trib FOR DELETE USING (true);

CREATE TRIGGER trg_fiscal_cclass_trib_updated_at
  BEFORE UPDATE ON public.fiscal_cclass_trib
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
