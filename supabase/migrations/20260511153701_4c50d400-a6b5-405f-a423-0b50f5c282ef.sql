-- Add image_url to categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update RLS policies (categories should already have RLS enabled, but let's ensure)
-- Usually categories are public for reading
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'categories' AND policyname = 'Categorias são visíveis para todos'
    ) THEN
        CREATE POLICY "Categorias são visíveis para todos" ON public.categories FOR SELECT USING (true);
    END IF;
END $$;