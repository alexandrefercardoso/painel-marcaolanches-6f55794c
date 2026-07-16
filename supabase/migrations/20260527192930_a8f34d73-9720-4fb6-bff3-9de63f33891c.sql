-- Grant access to printing tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.printer_sectors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.printers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.category_printer_mappings TO authenticated;

GRANT ALL ON public.printer_sectors TO service_role;
GRANT ALL ON public.printers TO service_role;
GRANT ALL ON public.category_printer_mappings TO service_role;

-- Create print_jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.print_jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.empresas(id),
    printer_id UUID REFERENCES public.printers(id),
    sector_id UUID REFERENCES public.printer_sectors(id),
    content JSONB NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, printing, completed, failed
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Grant access to print_jobs
GRANT SELECT, INSERT, UPDATE, DELETE ON public.print_jobs TO authenticated;
GRANT ALL ON public.print_jobs TO service_role;

-- Enable RLS for print_jobs
ALTER TABLE public.print_jobs ENABLE ROW LEVEL SECURITY;

-- Create policy for print_jobs
CREATE POLICY "Public print_jobs access" ON public.print_jobs FOR ALL TO public USING (true);

-- Ensure updated_at trigger exists for all tables
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_print_jobs_updated_at') THEN
        CREATE TRIGGER update_print_jobs_updated_at BEFORE UPDATE ON public.print_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;
