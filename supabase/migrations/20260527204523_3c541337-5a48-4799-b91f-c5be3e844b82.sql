-- Force grants on the schema itself
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';

-- Ensure the tables are owned by postgres (standard for Supabase)
ALTER TABLE IF EXISTS public.printer_sectors OWNER TO postgres;
ALTER TABLE IF EXISTS public.printers OWNER TO postgres;
ALTER TABLE IF EXISTS public.category_printer_mappings OWNER TO postgres;
ALTER TABLE IF EXISTS public.printing_jobs OWNER TO postgres;

-- Re-enable RLS just to be sure it triggers a refresh
ALTER TABLE public.printer_sectors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.printer_sectors ENABLE ROW LEVEL SECURITY;

-- Create an additional simple policy
DROP POLICY IF EXISTS "printer_sectors_simple_access" ON public.printer_sectors;
CREATE POLICY "printer_sectors_simple_access" ON public.printer_sectors FOR ALL TO public USING (true) WITH CHECK (true);
