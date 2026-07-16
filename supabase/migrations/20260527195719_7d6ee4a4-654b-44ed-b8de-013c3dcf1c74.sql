-- Fix permissions for printer_sectors
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.printer_sectors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.printer_sectors TO anon;
GRANT ALL ON TABLE public.printer_sectors TO service_role;

-- Fix permissions for printers
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.printers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.printers TO anon;
GRANT ALL ON TABLE public.printers TO service_role;

-- Fix permissions for category_printer_mappings
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.category_printer_mappings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.category_printer_mappings TO anon;
GRANT ALL ON TABLE public.category_printer_mappings TO service_role;

-- Fix permissions for printing_jobs
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.printing_jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.printing_jobs TO anon;
GRANT ALL ON TABLE public.printing_jobs TO service_role;

-- Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
