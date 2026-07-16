-- Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';

-- Ensure permissions are explicitly set for all possible roles
DO $$ 
BEGIN
    -- Grant to authenticated users (used by the frontend)
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.printer_sectors TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.printers TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.category_printer_mappings TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.printing_jobs TO authenticated;

    -- Grant to anonymous users (just in case, though RLS should handle security)
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.printer_sectors TO anon;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.printers TO anon;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.category_printer_mappings TO anon;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.printing_jobs TO anon;

    -- Grant to service_role (used by edge functions)
    GRANT ALL ON TABLE public.printer_sectors TO service_role;
    GRANT ALL ON TABLE public.printers TO service_role;
    GRANT ALL ON TABLE public.category_printer_mappings TO service_role;
    GRANT ALL ON TABLE public.printing_jobs TO service_role;
    
    -- Grant to postgres and pgbouncer (internal)
    GRANT ALL ON TABLE public.printer_sectors TO postgres;
    GRANT ALL ON TABLE public.printers TO postgres;
    GRANT ALL ON TABLE public.category_printer_mappings TO postgres;
    GRANT ALL ON TABLE public.printing_jobs TO postgres;
END $$;

-- Verify RLS is enabled and has a permissive policy
ALTER TABLE public.printer_sectors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for printer_sectors" ON public.printer_sectors;
CREATE POLICY "Allow all for printer_sectors" ON public.printer_sectors FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.printers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for printers" ON public.printers;
CREATE POLICY "Allow all for printers" ON public.printers FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.category_printer_mappings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for category_printer_mappings" ON public.category_printer_mappings;
CREATE POLICY "Allow all for category_printer_mappings" ON public.category_printer_mappings FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.printing_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for printing_jobs" ON public.printing_jobs;
CREATE POLICY "Allow all for printing_jobs" ON public.printing_jobs FOR ALL TO public USING (true) WITH CHECK (true);
