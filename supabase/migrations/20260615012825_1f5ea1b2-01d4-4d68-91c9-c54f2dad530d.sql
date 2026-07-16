ALTER TABLE public.products ADD COLUMN IF NOT EXISTS send_to_kds boolean DEFAULT true;
UPDATE public.products SET send_to_kds = COALESCE(send_to_production, true) WHERE send_to_kds IS NULL;