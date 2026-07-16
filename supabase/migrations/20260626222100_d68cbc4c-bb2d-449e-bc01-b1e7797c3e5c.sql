ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS fiscal_nfe_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS fiscal_nfce_enabled boolean NOT NULL DEFAULT false;