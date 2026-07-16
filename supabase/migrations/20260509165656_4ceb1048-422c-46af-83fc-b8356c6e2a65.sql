-- Create customers table
CREATE TABLE public.customers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create suppliers table
CREATE TABLE public.suppliers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to financial_transactions
ALTER TABLE public.financial_transactions 
ADD COLUMN payment_date DATE,
ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
ADD COLUMN customer_id UUID REFERENCES public.customers(id),
ADD COLUMN supplier_id UUID REFERENCES public.suppliers(id);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Permissive policies for management
CREATE POLICY "Manage customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Manage suppliers" ON public.suppliers FOR ALL USING (true) WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();