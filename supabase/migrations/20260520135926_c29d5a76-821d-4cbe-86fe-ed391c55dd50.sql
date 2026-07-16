-- Create complement_groups table
CREATE TABLE public.complement_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    min_choices INTEGER DEFAULT 0,
    max_choices INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create complements table
CREATE TABLE public.complements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.complement_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC DEFAULT 0,
    size_prices JSONB DEFAULT '{}'::jsonb, -- For different prices per size (e.g. pizza borders)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Link groups to categories
CREATE TABLE public.category_complement_groups (
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.complement_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (category_id, group_id)
);

-- Update delivery_order_items to store selected complements
ALTER TABLE public.delivery_order_items ADD COLUMN selected_complements JSONB DEFAULT '[]'::jsonb;

-- Enable RLS
ALTER TABLE public.complement_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_complement_groups ENABLE ROW LEVEL SECURITY;

-- Create policies (Public read for menu, Authenticated write for admin)
CREATE POLICY "Complement groups are viewable by everyone" ON public.complement_groups FOR SELECT USING (true);
CREATE POLICY "Complement groups are manageable by authenticated users" ON public.complement_groups FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Complements are viewable by everyone" ON public.complements FOR SELECT USING (true);
CREATE POLICY "Complements are manageable by authenticated users" ON public.complements FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Category complement groups are viewable by everyone" ON public.category_complement_groups FOR SELECT USING (true);
CREATE POLICY "Category complement groups are manageable by authenticated users" ON public.category_complement_groups FOR ALL USING (auth.role() = 'authenticated');

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_complement_groups_updated_at BEFORE UPDATE ON public.complement_groups FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_complements_updated_at BEFORE UPDATE ON public.complements FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Seed data based on user request
DO $$ 
DECLARE
    massa_group_id UUID;
    borda_group_id UUID;
    bebida_group_id UUID;
    pizza_cat_ids UUID[];
    bebida_cat_id UUID;
BEGIN
    -- 1. Tipo de Massa
    INSERT INTO public.complement_groups (name, min_choices, max_choices) 
    VALUES ('Tipo de Massa', 1, 1) RETURNING id INTO massa_group_id;

    INSERT INTO public.complements (group_id, name, price) VALUES (massa_group_id, 'Massa Fina', 0);
    INSERT INTO public.complements (group_id, name, price) VALUES (massa_group_id, 'Massa Tradicional', 0);

    -- 2. Bordas
    INSERT INTO public.complement_groups (name, min_choices, max_choices) 
    VALUES ('Bordas', 0, 1) RETURNING id INTO borda_group_id;

    INSERT INTO public.complements (group_id, name, price) VALUES (borda_group_id, 'Borda Normal', 0);
    INSERT INTO public.complements (group_id, name, size_prices) 
    VALUES (borda_group_id, 'Borda Recheada Catupiry', '{"Broto": 5.00, "Média": 7.00, "Grande": 10.00}'::jsonb);
    INSERT INTO public.complements (group_id, name, size_prices) 
    VALUES (borda_group_id, 'Borda Recheada Cheddar', '{"Broto": 5.00, "Média": 7.00, "Grande": 10.00}'::jsonb);
    INSERT INTO public.complements (group_id, name, size_prices) 
    VALUES (borda_group_id, 'Borda Recheada Chocolate', '{"Broto": 6.00, "Média": 8.00, "Grande": 12.00}'::jsonb);

    -- 3. Bebida Add-ons
    INSERT INTO public.complement_groups (name, min_choices, max_choices) 
    VALUES ('Adicionais Bebida', 0, 2) RETURNING id INTO bebida_group_id;

    INSERT INTO public.complements (group_id, name, price) VALUES (bebida_group_id, 'Gelo', 0);
    INSERT INTO public.complements (group_id, name, price) VALUES (bebida_group_id, 'Limão', 1.50);

    -- Link to categories (Fetch IDs dynamically)
    SELECT ARRAY_AGG(id) INTO pizza_cat_ids FROM public.categories WHERE name ILIKE '%Pizza%';
    SELECT id INTO bebida_cat_id FROM public.categories WHERE name ILIKE '%Bebida%' LIMIT 1;

    -- Link Pizzas
    IF pizza_cat_ids IS NOT NULL THEN
        FOR i IN 1..array_length(pizza_cat_ids, 1) LOOP
            INSERT INTO public.category_complement_groups (category_id, group_id) VALUES (pizza_cat_ids[i], massa_group_id);
            INSERT INTO public.category_complement_groups (category_id, group_id) VALUES (pizza_cat_ids[i], borda_group_id);
        END LOOP;
    END IF;

    -- Link Bebidas
    IF bebida_cat_id IS NOT NULL THEN
        INSERT INTO public.category_complement_groups (category_id, group_id) VALUES (bebida_cat_id, bebida_group_id);
    END IF;

END $$;
