-- Desabilitar RLS na tabela de categorias para permitir gerenciamento manual
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- Garantir permissões totais para anon e authenticated
GRANT ALL ON TABLE public.categories TO anon, authenticated, service_role;

-- Garantir que o ID tenha valor padrão se não tiver
ALTER TABLE public.categories ALTER COLUMN id SET DEFAULT gen_random_uuid();