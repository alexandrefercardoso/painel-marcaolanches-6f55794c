-- Garante que o RLS está habilitado
ALTER TABLE public.delivery_areas ENABLE ROW LEVEL SECURITY;

-- Permite que qualquer pessoa veja as áreas (necessário para o cardápio)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Delivery areas are viewable by everyone') THEN
        CREATE POLICY "Delivery areas are viewable by everyone" ON public.delivery_areas FOR SELECT USING (true);
    END IF;
END $$;

-- Permite inserção, atualização e exclusão para todos (Modo simplificado para o painel administrativo customizado)
-- Nota: Em produção com Supabase Auth, usaríamos auth.uid(), mas aqui seguimos o padrão do projeto
CREATE POLICY "Allow all operations for delivery areas" ON public.delivery_areas 
FOR ALL 
USING (true) 
WITH CHECK (true);