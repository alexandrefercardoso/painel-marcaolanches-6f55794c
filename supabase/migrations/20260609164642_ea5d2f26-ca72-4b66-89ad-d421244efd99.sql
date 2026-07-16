ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS can_cancel BOOLEAN DEFAULT false;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;