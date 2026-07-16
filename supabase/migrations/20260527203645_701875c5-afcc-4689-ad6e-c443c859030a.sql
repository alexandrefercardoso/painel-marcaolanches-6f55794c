-- Recarregar o cache do PostgREST para reconhecer a tabela printer_sectors
NOTIFY pgrst, 'reload schema';

-- Garantir permissões de acesso para as roles do Supabase
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.printer_sectors TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.printers TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.category_printer_mappings TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.printing_jobs TO anon, authenticated, service_role;
