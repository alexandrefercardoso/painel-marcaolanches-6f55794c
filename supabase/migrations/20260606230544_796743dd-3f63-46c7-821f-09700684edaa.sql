-- Garantir que existe pelo menos uma impressora virtual para o preview funcionar mesmo se o usuário excluir as outras
DO $$ 
DECLARE 
    company_uuid UUID;
BEGIN
    -- Tentar pegar o ID da empresa das configurações
    SELECT company_id INTO company_uuid FROM public.store_settings LIMIT 1;
    
    -- Se não encontrar, tentar pegar da tabela empresas
    IF company_uuid IS NULL THEN
        SELECT id INTO company_uuid FROM public.empresas LIMIT 1;
    END IF;

    -- Se ainda assim não tiver, usar o fallback comum
    IF company_uuid IS NULL THEN
        company_uuid := 'fcf65776-b407-4e2c-8e77-5599fc63ab63';
    END IF;

    -- Inserir uma impressora de sistema se não houver nenhuma ativa
    IF NOT EXISTS (SELECT 1 FROM public.printers WHERE is_active = true) THEN
        INSERT INTO public.printers (
            id, 
            company_id, 
            name, 
            connection_type, 
            is_active, 
            show_preview, 
            auto_print,
            model
        ) VALUES (
            gen_random_uuid(),
            company_uuid,
            'Impressora Virtual (Preview)',
            'virtual',
            true,
            true,
            true,
            'Generic ESC/POS'
        );
    END IF;
END $$;

-- Garantir que a coluna centralized_printing existe (caso a migração anterior tenha falhado ou sido pulada)
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS centralized_printing BOOLEAN DEFAULT false;
