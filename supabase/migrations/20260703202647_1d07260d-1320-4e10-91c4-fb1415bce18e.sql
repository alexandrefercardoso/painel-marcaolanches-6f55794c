
ALTER TABLE public.product_tax_rules
  ADD COLUMN IF NOT EXISTS cst_icms_estadual text,
  ADD COLUMN IF NOT EXISTS cst_icms_interestadual text,
  ADD COLUMN IF NOT EXISTS orig_icms integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS aliq_icms numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS red_bc numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cfop_estadual text,
  ADD COLUMN IF NOT EXISTS cfop_interestadual text,
  ADD COLUMN IF NOT EXISTS cst_pis text NOT NULL DEFAULT '49',
  ADD COLUMN IF NOT EXISTS aliq_pis numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cst_cofins text NOT NULL DEFAULT '49',
  ADD COLUMN IF NOT EXISTS aliq_cofins numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS aliq_ibsuf numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS aliq_ibsmun numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS aliq_cbs numeric NOT NULL DEFAULT 0;

-- Copia valores legados dos campos antigos, se existirem, para os novos
UPDATE public.product_tax_rules
   SET cst_icms_estadual = COALESCE(cst_icms_estadual, cst),
       cfop_estadual     = COALESCE(cfop_estadual, cfop),
       aliq_ibsuf        = COALESCE(NULLIF(aliq_ibsuf, 0), aliquota_ibs, 0),
       aliq_cbs          = COALESCE(NULLIF(aliq_cbs, 0), aliquota_cbs, 0);
