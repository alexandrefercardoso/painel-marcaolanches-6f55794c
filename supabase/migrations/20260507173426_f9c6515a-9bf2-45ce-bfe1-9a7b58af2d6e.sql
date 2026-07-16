-- Categorias Financeiras
CREATE TABLE public.financial_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Transações Financeiras
CREATE TABLE public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category_id UUID REFERENCES public.financial_categories(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Apenas autenticados gerenciam categorias financeiras" 
ON public.financial_categories FOR ALL 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Apenas autenticados gerenciam transações" 
ON public.financial_transactions FOR ALL 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

-- Inserir categorias iniciais
INSERT INTO public.financial_categories (name, type) VALUES 
('Vendas', 'income'),
('Aluguel', 'expense'),
('Ingredientes', 'expense'),
('Funcionários', 'expense'),
('Marketing', 'expense'),
('Outros', 'expense');
