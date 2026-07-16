ALTER TABLE public.waiters ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

GRANT SELECT, UPDATE ON public.waiters TO authenticated;
GRANT ALL ON public.waiters TO service_role;
GRANT SELECT, UPDATE ON public.drivers TO authenticated;
GRANT ALL ON public.drivers TO service_role;
