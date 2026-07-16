-- 1. Garantir que as tabelas existam no esquema public
CREATE TABLE IF NOT EXISTS public.printer_sectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.empresas(id),
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    printing_type TEXT DEFAULT 'complete',
    auto_print BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.printers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.empresas(id),
    sector_id UUID REFERENCES public.printer_sectors(id),
    name TEXT NOT NULL,
    description TEXT,
    connection_type TEXT DEFAULT 'tcp',
    ip_address TEXT,
    port INTEGER DEFAULT 9100,
    model TEXT,
    copies INTEGER DEFAULT 1,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    auto_print BOOLEAN DEFAULT true,
    esc_pos_compatible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.category_printer_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.empresas(id),
    category_id UUID REFERENCES public.categories(id),
    sector_id UUID REFERENCES public.printer_sectors(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(category_id, sector_id)
);

CREATE TABLE IF NOT EXISTS public.printing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.empresas(id),
    printer_id UUID REFERENCES public.printers(id),
    order_id UUID REFERENCES public.delivery_orders(id),
    status TEXT DEFAULT 'pending',
    content JSONB,
    error_message TEXT,
    printed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Garantir permissões de acesso para a API (PostgREST)
GRANT ALL ON TABLE public.printer_sectors TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.printers TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.category_printer_mappings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.printing_jobs TO anon, authenticated, service_role;

-- 3. Habilitar RLS e criar políticas permissivas para funcionamento imediato
ALTER TABLE public.printer_sectors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "printer_sectors_full_access" ON public.printer_sectors;
CREATE POLICY "printer_sectors_full_access" ON public.printer_sectors FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.printers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "printers_full_access" ON public.printers;
CREATE POLICY "printers_full_access" ON public.printers FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.category_printer_mappings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mappings_full_access" ON public.category_printer_mappings;
CREATE POLICY "mappings_full_access" ON public.category_printer_mappings FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.printing_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "jobs_full_access" ON public.printing_jobs;
CREATE POLICY "jobs_full_access" ON public.printing_jobs FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. Forçar o Supabase/PostgREST a recarregar o cache do esquema
NOTIFY pgrst, 'reload schema';
