-- Adicionar colunas se não existirem
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sell_delivery BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sell_dine_in BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sell_digital_menu BOOLEAN DEFAULT true;

-- Garantir que a coluna active existe (ela já aparece no read_query, mas por segurança)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'active') THEN
        ALTER TABLE public.products ADD COLUMN active BOOLEAN DEFAULT true;
    END IF;
END $$;