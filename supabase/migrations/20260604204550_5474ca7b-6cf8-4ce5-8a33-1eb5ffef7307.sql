-- Ensure role column exists (it already does, but let's be safe and set a default)
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'funcionario';

-- Update existing users with null roles to 'funcionario'
UPDATE public.profiles SET role = 'funcionario' WHERE role IS NULL;

-- Ensure permissions are correct
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
