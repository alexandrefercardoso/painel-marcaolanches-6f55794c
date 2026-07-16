-- Re-create the table to ensure it exists with the correct structure
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

-- Grant permissions explicitly
GRANT SELECT, INSERT, UPDATE, DELETE ON public.printer_sectors TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.printers TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.category_printer_mappings TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.printing_jobs TO anon, authenticated, service_role;

-- Enable RLS and create permissive policy for testing/immediate fix
ALTER TABLE public.printer_sectors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access for printer_sectors" ON public.printer_sectors;
CREATE POLICY "Public access for printer_sectors" ON public.printer_sectors FOR ALL TO public USING (true) WITH CHECK (true);

-- Force PostgREST to reload
NOTIFY pgrst, 'reload schema';
