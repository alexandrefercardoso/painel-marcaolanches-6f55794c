-- Remover foreign keys e colunas company_id de todas as tabelas
-- Nota: O usuário informou que o banco já foi atualizado, mas para garantir a consistência dos tipos do Supabase (gerados via introspecção), realizamos a limpeza formal se ainda existirem referências.

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Loop por todas as tabelas que possuem a coluna company_id no schema public
    FOR r IN (
        SELECT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND column_name = 'company_id'
    ) LOOP
        -- Remover a constraint de foreign key primeiro se existir
        EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', 
            r.table_name, r.table_name || '_company_id_fkey');
        
        -- Remover a coluna
        EXECUTE format('ALTER TABLE public.%I DROP COLUMN IF EXISTS company_id', r.table_name);
    END LOOP;
END $$;

-- Remover a tabela empresas se não for mais necessária (opcional, mas limpo)
DROP TABLE IF EXISTS public.empresas CASCADE;
