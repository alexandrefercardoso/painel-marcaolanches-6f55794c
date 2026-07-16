-- Migration para forçar renovação do cache e limpar dependências ocultas

-- 1. Backup temporário dos dados (opcional, mas seguro)
CREATE TEMP TABLE temp_printers AS SELECT * FROM public.printers;
CREATE TEMP TABLE temp_printer_sectors AS SELECT * FROM public.printer_sectors;

-- 2. Remover tabelas dependentes e principais
DROP TABLE IF EXISTS public.category_printer_mappings CASCADE;
DROP TABLE IF EXISTS public.print_jobs CASCADE;
DROP TABLE IF EXISTS public.printing_jobs CASCADE;
DROP TABLE IF EXISTS public.printers CASCADE;
DROP TABLE IF EXISTS public.printer_sectors CASCADE;

-- 3. Criar tabelas novamente SEM company_id
CREATE TABLE public.printer_sectors (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.printers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    sector_id UUID REFERENCES public.printer_sectors(id) ON DELETE SET NULL,
    connection_type TEXT DEFAULT 'network',
    ip_address TEXT,
    port INTEGER DEFAULT 9100,
    model TEXT,
    is_active BOOLEAN DEFAULT true,
    auto_print BOOLEAN DEFAULT false,
    copies INTEGER DEFAULT 1,
    priority INTEGER DEFAULT 1,
    esc_pos_compatible BOOLEAN DEFAULT true,
    show_preview BOOLEAN DEFAULT false,
    auto_browser_print BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.printing_jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    printer_id UUID REFERENCES public.printers(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.print_jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    printer_id UUID REFERENCES public.printers(id) ON DELETE CASCADE,
    sector_id UUID REFERENCES public.printer_sectors(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.category_printer_mappings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID NOT NULL,
    sector_id UUID REFERENCES public.printer_sectors(id) ON DELETE CASCADE
);

-- 4. Restaurar dados (ignorando colunas que não existem mais)
INSERT INTO public.printer_sectors (id, name, description, created_at, updated_at)
SELECT id, name, description, created_at, updated_at FROM temp_printer_sectors;

INSERT INTO public.printers (
    id, name, description, sector_id, connection_type, ip_address, port, 
    model, is_active, auto_print, copies, priority, esc_pos_compatible, 
    show_preview, auto_browser_print, created_at, updated_at
)
SELECT 
    id, name, description, sector_id, connection_type, ip_address, port, 
    model, is_active, auto_print, copies, priority, esc_pos_compatible, 
    show_preview, auto_browser_print, created_at, updated_at 
FROM temp_printers;

-- 5. Grant permissions
GRANT ALL ON public.printer_sectors TO authenticated, service_role, anon;
GRANT ALL ON public.printers TO authenticated, service_role, anon;
GRANT ALL ON public.printing_jobs TO authenticated, service_role, anon;
GRANT ALL ON public.print_jobs TO authenticated, service_role, anon;
GRANT ALL ON public.category_printer_mappings TO authenticated, service_role, anon;

-- 6. Enable RLS and create public policies (matching current permissive state)
ALTER TABLE public.printer_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_printer_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access" ON public.printer_sectors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON public.printers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON public.printing_jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON public.print_jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON public.category_printer_mappings FOR ALL USING (true) WITH CHECK (true);

-- 7. Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_printer_sectors_updated_at BEFORE UPDATE ON public.printer_sectors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_printers_updated_at BEFORE UPDATE ON public.printers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_printing_jobs_updated_at BEFORE UPDATE ON public.printing_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_print_jobs_updated_at BEFORE UPDATE ON public.print_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
