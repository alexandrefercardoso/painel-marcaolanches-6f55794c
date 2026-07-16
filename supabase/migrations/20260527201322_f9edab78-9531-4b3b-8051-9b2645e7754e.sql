-- Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';

-- Re-grant everything explicitly for the API roles
GRANT ALL ON public.printer_sectors TO authenticated;
GRANT ALL ON public.printer_sectors TO anon;
GRANT ALL ON public.printer_sectors TO service_role;

-- Ensure RLS is active and has a public policy for now
ALTER TABLE public.printer_sectors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "printer_sectors_full_access" ON public.printer_sectors;
CREATE POLICY "printer_sectors_full_access" ON public.printer_sectors FOR ALL TO public USING (true) WITH CHECK (true);

-- Also do it for other related tables
GRANT ALL ON public.printers TO authenticated, anon, service_role;
GRANT ALL ON public.category_printer_mappings TO authenticated, anon, service_role;
GRANT ALL ON public.printing_jobs TO authenticated, anon, service_role;

ALTER TABLE public.printers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "printers_full_access" ON public.printers;
CREATE POLICY "printers_full_access" ON public.printers FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.category_printer_mappings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mappings_full_access" ON public.category_printer_mappings;
CREATE POLICY "mappings_full_access" ON public.category_printer_mappings FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.printing_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "jobs_full_access" ON public.printing_jobs;
CREATE POLICY "jobs_full_access" ON public.printing_jobs FOR ALL TO public USING (true) WITH CHECK (true);
