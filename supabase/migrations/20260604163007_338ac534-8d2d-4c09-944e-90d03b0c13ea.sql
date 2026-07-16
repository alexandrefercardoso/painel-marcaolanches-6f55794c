-- Add login and password to drivers table
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS login TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS password TEXT;

-- Grant permissions (as required by the system)
GRANT ALL ON public.drivers TO authenticated;
GRANT ALL ON public.drivers TO service_role;
GRANT ALL ON public.drivers TO anon;
