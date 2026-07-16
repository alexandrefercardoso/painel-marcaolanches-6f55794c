-- 1. Forçar a API do Supabase (PostgREST) a recarregar o cache do esquema
-- Isso resolve o erro "Could not find the table ... in the schema cache"
NOTIFY pgrst, 'reload schema';

-- 2. Garantir que as roles de API tenham acesso explícito
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.printer_sectors TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.printers TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.category_printer_mappings TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.printing_jobs TO anon, authenticated, service_role;

-- 3. Garantir que o RLS não esteja bloqueando a visibilidade inicial
ALTER TABLE public.printer_sectors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_printer_sectors" ON public.printer_sectors;
CREATE POLICY "allow_all_printer_sectors" ON public.printer_sectors FOR ALL TO public USING (true) WITH CHECK (true);
