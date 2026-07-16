-- 1. Obter o ID da empresa e do setor cozinha
DO $$
DECLARE
    v_company_id UUID;
    v_sector_id UUID;
BEGIN
    SELECT company_id INTO v_company_id FROM public.store_settings LIMIT 1;
    SELECT id INTO v_sector_id FROM public.printer_sectors WHERE name = 'cozinha' AND company_id = v_company_id LIMIT 1;

    -- Se não existir setor cozinha, criar um
    IF v_sector_id IS NULL AND v_company_id IS NOT NULL THEN
        INSERT INTO public.printer_sectors (company_id, name, display_name, auto_print)
        VALUES (v_company_id, 'cozinha', 'Cozinha', true)
        RETURNING id INTO v_sector_id;
    END IF;

    -- 2. Criar uma impressora virtual de navegador se não houver nenhuma
    IF v_company_id IS NOT NULL AND v_sector_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.printers WHERE company_id = v_company_id) THEN
        INSERT INTO public.printers (
            company_id, 
            sector_id, 
            name, 
            connection_type, 
            auto_print, 
            auto_browser_print, 
            show_preview,
            is_active
        ) VALUES (
            v_company_id, 
            v_sector_id, 
            'Navegador Cozinha', 
            'virtual', 
            true, 
            true, 
            false,
            true
        );
        
        -- 3. Vincular categorias ao setor Cozinha se não houver vínculos
        IF NOT EXISTS (SELECT 1 FROM public.category_printer_mappings WHERE company_id = v_company_id) THEN
            INSERT INTO public.category_printer_mappings (company_id, category_id, sector_id)
            SELECT v_company_id, id, v_sector_id FROM public.categories;
        END IF;
    END IF;
END $$;
