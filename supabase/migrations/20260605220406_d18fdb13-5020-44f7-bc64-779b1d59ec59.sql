-- Ensure the table exists (it should, but good for completeness)
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID,
    name TEXT,
    whatsapp_number TEXT,
    email TEXT,
    cnpj TEXT,
    cpf TEXT,
    zip_code TEXT,
    address TEXT,
    address_number TEXT,
    complement TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    logo_url TEXT,
    sidebar_logo_url TEXT,
    opening_hours JSONB DEFAULT '{"monday":{"open":"18:00","close":"23:00","active":true},"tuesday":{"open":"18:00","close":"23:00","active":true},"wednesday":{"open":"18:00","close":"23:00","active":true},"thursday":{"open":"18:00","close":"23:00","active":true},"friday":{"open":"18:00","close":"00:00","active":true},"saturday":{"open":"18:00","close":"00:00","active":true},"sunday":{"open":"18:00","close":"23:00","active":true}}'::jsonb,
    is_menu_active BOOLEAN DEFAULT true,
    auto_manage_menu BOOLEAN DEFAULT false,
    google_maps_api_key TEXT,
    delivery_enabled BOOLEAN DEFAULT true,
    pickup_enabled BOOLEAN DEFAULT true,
    fixed_delivery_fee DECIMAL(10,2),
    default_driver_fee DECIMAL(10,2) DEFAULT 0.00,
    kds_enabled BOOLEAN DEFAULT true,
    service_tax_enabled BOOLEAN DEFAULT false,
    service_tax_percent DECIMAL(5,2) DEFAULT 10.00,
    couvert_artistico_enabled BOOLEAN DEFAULT false,
    couvert_artistico_value DECIMAL(10,2) DEFAULT 0.00,
    digital_menu_url TEXT,
    idle_table_time_minutes INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure there is at least one row
INSERT INTO public.store_settings (id, name)
SELECT gen_random_uuid(), 'Minha Empresa'
WHERE NOT EXISTS (SELECT 1 FROM public.store_settings)
ON CONFLICT DO NOTHING;

-- Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_settings TO anon;
GRANT ALL ON public.store_settings TO service_role;

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Create/Replace policy for public access (since the app seems to use it without heavy auth constraints on this table)
DROP POLICY IF EXISTS "Public access to store_settings" ON public.store_settings;
CREATE POLICY "Public access to store_settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);
