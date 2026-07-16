-- Create printer sectors table
CREATE TABLE public.printer_sectors (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    printing_type TEXT DEFAULT 'complete',
    auto_print BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.printer_sectors TO authenticated;
GRANT ALL ON public.printer_sectors TO service_role;

-- Create printers table
CREATE TABLE public.printers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sector_id UUID REFERENCES public.printer_sectors(id) ON DELETE SET NULL,
    connection_type TEXT NOT NULL,
    ip_address TEXT,
    port INTEGER,
    model TEXT,
    is_active BOOLEAN DEFAULT true,
    auto_print BOOLEAN DEFAULT true,
    copies INTEGER DEFAULT 1,
    priority INTEGER DEFAULT 0,
    esc_pos_compatible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.printers TO authenticated;
GRANT ALL ON public.printers TO service_role;

-- Create category to sector mapping
CREATE TABLE public.category_printer_mappings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    sector_id UUID NOT NULL REFERENCES public.printer_sectors(id) ON DELETE CASCADE,
    UNIQUE(company_id, category_id, sector_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.category_printer_mappings TO authenticated;
GRANT ALL ON public.category_printer_mappings TO service_role;

-- Create printing jobs (the queue)
CREATE TABLE public.printing_jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    printer_id UUID NOT NULL REFERENCES public.printers(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    error_message TEXT,
    content JSONB,
    retries INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.printing_jobs TO authenticated;
GRANT ALL ON public.printing_jobs TO service_role;

-- Enable RLS
ALTER TABLE public.printer_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_printer_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printing_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public printer_sectors access" ON public.printer_sectors FOR ALL USING (true);
CREATE POLICY "Public printers access" ON public.printers FOR ALL USING (true);
CREATE POLICY "Public category_printer_mappings access" ON public.category_printer_mappings FOR ALL USING (true);
CREATE POLICY "Public printing_jobs access" ON public.printing_jobs FOR ALL USING (true);

-- Insert default sectors
INSERT INTO public.printer_sectors (company_id, name, display_name, description)
SELECT id, 'caixa', 'Caixa', 'Impressão de cupom fiscal e conferência' FROM public.empresas;

INSERT INTO public.printer_sectors (company_id, name, display_name, description)
SELECT id, 'cozinha', 'Cozinha', 'Produção de alimentos' FROM public.empresas;

INSERT INTO public.printer_sectors (company_id, name, display_name, description)
SELECT id, 'bar', 'Bar', 'Produção de bebidas' FROM public.empresas;

INSERT INTO public.printer_sectors (company_id, name, display_name, description)
SELECT id, 'delivery', 'Delivery', 'Expedição e entrega' FROM public.empresas;