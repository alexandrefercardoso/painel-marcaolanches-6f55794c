DROP POLICY IF EXISTS "Profiles are viewable by authenticated" ON public.profiles;
CREATE POLICY "Profiles are viewable by app" ON public.profiles FOR SELECT USING (true);
GRANT SELECT ON public.profiles TO anon;