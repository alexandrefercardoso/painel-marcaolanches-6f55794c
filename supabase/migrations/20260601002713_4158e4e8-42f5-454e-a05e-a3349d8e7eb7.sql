-- Create table to link products directly to complement groups
CREATE TABLE IF NOT EXISTS public.product_complement_groups (
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.complement_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (product_id, group_id)
);

-- Grant permissions
GRANT SELECT ON public.product_complement_groups TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_complement_groups TO authenticated;
GRANT ALL ON public.product_complement_groups TO service_role;

-- Enable RLS
ALTER TABLE public.product_complement_groups ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Product complement groups are viewable by everyone" 
ON public.product_complement_groups FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage product complement groups" 
ON public.product_complement_groups FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
