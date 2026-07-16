-- Add new columns to store_settings
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS couvert_artistico_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS couvert_artistico_value NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_tax_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS service_tax_percent NUMERIC(5,2) DEFAULT 10,
ADD COLUMN IF NOT EXISTS idle_table_time_minutes INTEGER DEFAULT 50;

-- Create waiters table
CREATE TABLE IF NOT EXISTS public.waiters (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE,
    name TEXT NOT NULL,
    login TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    active BOOLEAN DEFAULT true,
    has_commission BOOLEAN DEFAULT true,
    commission_percent NUMERIC(5,2) DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create restaurant_tables table
CREATE TABLE IF NOT EXISTS public.restaurant_tables (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    number TEXT NOT NULL,
    prefix TEXT,
    sector TEXT,
    qr_code_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(number, prefix, sector)
);

-- Create table_sessions table
CREATE TABLE IF NOT EXISTS public.table_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    table_id UUID REFERENCES public.restaurant_tables(id),
    waiter_id UUID REFERENCES public.waiters(id),
    customer_id UUID REFERENCES public.customers(id),
    client_name TEXT,
    command_number TEXT,
    people_count INTEGER DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'open', -- 'open', 'bill_requested', 'closed', 'canceled'
    opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    closed_at TIMESTAMP WITH TIME ZONE,
    couvert_value NUMERIC(10,2) DEFAULT 0,
    service_tax_value NUMERIC(10,2) DEFAULT 0,
    total_amount NUMERIC(10,2) DEFAULT 0,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table_order_items table
CREATE TABLE IF NOT EXISTS public.table_order_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.table_sessions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    observations TEXT,
    printed BOOLEAN DEFAULT false,
    waiter_id UUID REFERENCES public.waiters(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update customers table for 'fiado'
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS allow_fiado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_balance NUMERIC(10,2) DEFAULT 0;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waiters TO authenticated;
GRANT ALL ON public.waiters TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant_tables TO authenticated;
GRANT ALL ON public.restaurant_tables TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.table_sessions TO authenticated;
GRANT ALL ON public.table_sessions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.table_order_items TO authenticated;
GRANT ALL ON public.table_order_items TO service_role;

-- Enable RLS
ALTER TABLE public.waiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_order_items ENABLE ROW LEVEL SECURITY;

-- Create basic policies (assuming all authenticated users can access)
CREATE POLICY "Authenticated users can manage waiters" ON public.waiters FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage tables" ON public.restaurant_tables FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage sessions" ON public.table_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage order items" ON public.table_order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_waiters_updated_at BEFORE UPDATE ON public.waiters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_restaurant_tables_updated_at BEFORE UPDATE ON public.restaurant_tables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_table_sessions_updated_at BEFORE UPDATE ON public.table_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
