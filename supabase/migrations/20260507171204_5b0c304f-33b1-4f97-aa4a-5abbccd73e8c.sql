-- Create categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    image_url TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policies for public access (Select)
CREATE POLICY "Allow public select categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public select products" ON public.products FOR SELECT USING (true);

-- Policies for authenticated users (Full access)
CREATE POLICY "Allow authenticated users to manage categories" 
ON public.categories FOR ALL 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage products" 
ON public.products FOR ALL 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

-- Insert initial categories
INSERT INTO public.categories (name) VALUES ('Pizzas'), ('Bebidas') ON CONFLICT DO NOTHING;
