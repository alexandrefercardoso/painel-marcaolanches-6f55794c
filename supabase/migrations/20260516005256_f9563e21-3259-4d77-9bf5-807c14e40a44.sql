-- Adiciona coluna chart_account_id à tabela payment_methods se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'payment_methods' AND column_name = 'chart_account_id') THEN
        ALTER TABLE public.payment_methods ADD COLUMN chart_account_id UUID REFERENCES public.chart_of_accounts(id);
    END IF;
END $$;

-- Adiciona coluna chart_account_id à tabela financial_categories se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'financial_categories' AND column_name = 'chart_account_id') THEN
        ALTER TABLE public.financial_categories ADD COLUMN chart_account_id UUID REFERENCES public.chart_of_accounts(id);
    END IF;
END $$;