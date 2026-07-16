-- Verifica se a coluna já existe antes de tentar adicionar
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'table_sessions' AND column_name = 'payment_method') THEN
        ALTER TABLE public.table_sessions ADD COLUMN payment_method TEXT;
    END IF;
END $$;
