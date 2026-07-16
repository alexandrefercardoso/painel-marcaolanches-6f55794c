-- Add new columns to profiles for specific permissions
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS can_delete BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_kds_only BOOLEAN DEFAULT FALSE;

-- Grant permissions (standard for this project)
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.profiles TO anon;
