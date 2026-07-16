GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.printer_sectors TO authenticated, anon, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.printers TO authenticated, anon, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.category_printer_mappings TO authenticated, anon, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.printing_jobs TO authenticated, anon, service_role;

NOTIFY pgrst, 'reload schema';
