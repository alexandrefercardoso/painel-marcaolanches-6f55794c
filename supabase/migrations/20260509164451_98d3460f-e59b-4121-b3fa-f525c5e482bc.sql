-- Enable RLS for financial_categories
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Manage financial categories" ON public.financial_categories;
DROP POLICY IF EXISTS "Allow public read financial categories" ON public.financial_categories;

-- Create full permissive policy for anyone to manage financial categories
CREATE POLICY "Manage financial categories" ON public.financial_categories
FOR ALL
USING (true)
WITH CHECK (true);

-- Also ensure profiles table has a policy if it's being used by admin
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on profiles" ON public.profiles;
CREATE POLICY "Allow all on profiles" ON public.profiles
FOR ALL
USING (true)
WITH CHECK (true);