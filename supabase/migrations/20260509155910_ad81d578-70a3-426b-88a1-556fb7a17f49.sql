-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing restricted policy
DROP POLICY IF EXISTS "Allow authenticated users to manage categories" ON public.categories;

-- Create a more permissive policy for categories to match the admin flow (local session based)
-- Note: In a production app, we would ideally use Supabase Auth, but to fix the current issue 
-- where the user can't add categories, we align with the current implementation.
CREATE POLICY "Allow anyone to manage categories" 
ON public.categories 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Ensure public select is still there (redundant but safe)
DROP POLICY IF EXISTS "Allow public select categories" ON public.categories;
CREATE POLICY "Allow public select categories" 
ON public.categories 
FOR SELECT 
USING (true);