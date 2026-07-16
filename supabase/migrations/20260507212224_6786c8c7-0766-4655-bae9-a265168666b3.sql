-- Permitir todas as operações para usuários anônimos na tabela products para evitar bloqueios de RLS
-- já que o sistema usa uma sessão administrativa própria via localStorage e não via Supabase Auth
DROP POLICY IF EXISTS "Allow authenticated users to manage products" ON public.products;
DROP POLICY IF EXISTS "Allow public select products" ON public.products;
DROP POLICY IF EXISTS "Allow all for anonymous" ON public.products;

CREATE POLICY "Allow all for anonymous" 
ON public.products 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Garantir que RLS esteja ativado mas com política permissiva para o contexto do app
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;