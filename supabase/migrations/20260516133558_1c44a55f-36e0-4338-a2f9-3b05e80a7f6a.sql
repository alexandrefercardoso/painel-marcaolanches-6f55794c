DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'person_type') THEN
        CREATE TYPE person_type AS ENUM ('fisica', 'juridica');
    END IF;
END $$;

ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS person_type person_type DEFAULT 'fisica',
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS cnpj TEXT;

-- Index for performance when searching by CPF/CNPJ
CREATE INDEX IF NOT EXISTS idx_customers_cpf ON public.customers(cpf);
CREATE INDEX IF NOT EXISTS idx_customers_cnpj ON public.customers(cnpj);
