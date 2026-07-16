-- Create Chart of Accounts table
CREATE TABLE public.chart_of_accounts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES public.chart_of_accounts(id),
    type TEXT CHECK (type IN ('revenue', 'cost', 'expense')),
    level INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Everyone can view chart of accounts" 
ON public.chart_of_accounts FOR SELECT USING (true);

CREATE POLICY "Admins can manage chart of accounts" 
ON public.chart_of_accounts FOR ALL USING (true) WITH CHECK (true);

-- Add chart_account_id to financial_transactions
ALTER TABLE public.financial_transactions 
ADD COLUMN chart_account_id UUID REFERENCES public.chart_of_accounts(id);

-- Insert Initial Chart of Accounts (Creative and standard)
-- Level 1: Receitas (1)
INSERT INTO public.chart_of_accounts (id, code, name, type, level) 
VALUES ('10000000-0000-0000-0000-000000000001', '1', 'Receitas', 'revenue', 1);

-- Level 2 under Receitas
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('10000000-0000-0000-0000-000000000002', '1.1', 'Receitas Operacionais', '10000000-0000-0000-0000-000000000001', 'revenue', 2);

-- Level 3 under Receitas Operacionais
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('10000000-0000-0000-0000-000000000003', '1.1.01', 'Vendas de Balcão', '10000000-0000-0000-0000-000000000002', 'revenue', 3);
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('10000000-0000-0000-0000-000000000004', '1.1.02', 'Vendas Delivery', '10000000-0000-0000-0000-000000000002', 'revenue', 3);

-- Level 1: Custos (2)
INSERT INTO public.chart_of_accounts (id, code, name, type, level) 
VALUES ('20000000-0000-0000-0000-000000000001', '2', 'Custos', 'cost', 1);

-- Level 2 under Custos
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('20000000-0000-0000-0000-000000000002', '2.1', 'CMV (Custo de Mercadoria Vendida)', '20000000-0000-0000-0000-000000000001', 'cost', 2);
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('20000000-0000-0000-0000-000000000003', '2.2', 'Custos com Insumos', '20000000-0000-0000-0000-000000000001', 'cost', 2);

-- Level 1: Despesas (3)
INSERT INTO public.chart_of_accounts (id, code, name, type, level) 
VALUES ('30000000-0000-0000-0000-000000000001', '3', 'Despesas', 'expense', 1);

-- Level 2 under Despesas
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('30000000-0000-0000-0000-000000000002', '3.1', 'Despesas Operacionais', '30000000-0000-0000-0000-000000000001', 'expense', 2);
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('30000000-0000-0000-0000-000000000003', '3.2', 'Despesas com Pessoal', '30000000-0000-0000-0000-000000000001', 'expense', 2);
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('30000000-0000-0000-0000-000000000004', '3.3', 'Despesas Administrativas', '30000000-0000-0000-0000-000000000001', 'expense', 2);

-- Level 3 under Despesas Operacionais
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('30000000-0000-0000-0000-000000000005', '3.1.01', 'Aluguel', '30000000-0000-0000-0000-000000000002', 'expense', 3);
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('30000000-0000-0000-0000-000000000006', '3.1.02', 'Energia Elétrica', '30000000-0000-0000-0000-000000000002', 'expense', 3);
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('30000000-0000-0000-0000-000000000007', '3.1.03', 'Internet / Telefone', '30000000-0000-0000-0000-000000000002', 'expense', 3);

-- Level 3 under Despesas com Pessoal
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('30000000-0000-0000-0000-000000000008', '3.2.01', 'Salários', '30000000-0000-0000-0000-000000000003', 'expense', 3);
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('30000000-0000-0000-0000-000000000009', '3.2.02', 'Encargos Sociais', '30000000-0000-0000-0000-000000000003', 'expense', 3);
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('30000000-0000-0000-0000-000000000010', '3.2.03', 'Pro-labore', '30000000-0000-0000-0000-000000000003', 'expense', 3);
