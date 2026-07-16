ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
