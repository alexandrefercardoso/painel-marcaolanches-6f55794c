-- Fix categories policies to be absolutely permissive
DROP POLICY IF EXISTS "Allow public select categories" ON public.categories;
DROP POLICY IF EXISTS "Allow anyone to manage categories" ON public.categories;

CREATE POLICY "Manage categories" ON public.categories 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;