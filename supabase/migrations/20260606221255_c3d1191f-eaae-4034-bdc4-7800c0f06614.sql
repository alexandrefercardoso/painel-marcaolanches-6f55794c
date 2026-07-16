-- Primeiro, garantir que exista um setor chamado 'caixa' se não houver nenhum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.printer_sectors WHERE name = 'caixa') THEN
        INSERT INTO public.printer_sectors (name, display_name, is_active, auto_print, printing_type)
        VALUES ('caixa', 'CAIXA (GERAL)', true, true, 'full');
    END IF;
END $$;

-- Garantir que todas as impressoras sem setor sejam movidas para o 'caixa' para simplificar
UPDATE public.printers 
SET sector_id = (SELECT id FROM public.printer_sectors WHERE name = 'caixa' LIMIT 1)
WHERE sector_id IS NULL;