-- Ensure RLS is enabled
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow anyone to manage categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public select categories" ON public.categories;
DROP POLICY IF EXISTS "Allow anyone to manage products" ON public.products;
DROP POLICY IF EXISTS "Allow public select products" ON public.products;

-- Re-create permissive policies for admin operations
-- Categories
CREATE POLICY "Allow anyone to manage categories" 
ON public.categories 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Products
CREATE POLICY "Allow anyone to manage products" 
ON public.products 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Ensure public select
CREATE POLICY "Allow public select categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public select products" ON public.products FOR SELECT USING (true);