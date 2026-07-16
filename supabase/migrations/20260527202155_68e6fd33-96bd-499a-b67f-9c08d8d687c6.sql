-- Garantir que as roles tenham acesso
GRANT SELECT, INSERT, UPDATE, DELETE ON public.printer_sectors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.printer_sectors TO authenticated;
GRANT ALL ON public.printer_sectors TO service_role;

-- Repetir para outras tabelas relacionadas para evitar o mesmo erro
GRANT SELECT, INSERT, UPDATE, DELETE ON public.printers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.printers TO authenticated;
GRANT ALL ON public.printers TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.category_printer_mappings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.category_printer_mappings TO authenticated;
GRANT ALL ON public.category_printer_mappings TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.printing_jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.printing_jobs TO authenticated;
GRANT ALL ON public.printing_jobs TO service_role;

-- Forçar recarregamento do cache da API
NOTIFY pgrst, 'reload schema';
